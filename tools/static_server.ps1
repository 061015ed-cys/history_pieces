param(
    [int]$Port = 5517
)

$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$RootPrefix = $Root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

function Get-ContentType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".mjs"  { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".txt"  { return "text/plain; charset=utf-8" }
        ".md"   { return "text/plain; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif"  { return "image/gif" }
        ".webp" { return "image/webp" }
        ".ico"  { return "image/x-icon" }
        ".mp4"  { return "video/mp4" }
        ".webm" { return "video/webm" }
        ".woff" { return "font/woff" }
        ".woff2" { return "font/woff2" }
        default  { return "application/octet-stream" }
    }
}

function Write-ResponseHeader(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$Reason,
    [long]$Length,
    [string]$ContentType,
    [string[]]$ExtraHeaders
) {
    $Lines = [System.Collections.Generic.List[string]]::new()
    $Lines.Add("HTTP/1.1 $Status $Reason")
    $Lines.Add("Content-Length: $Length")
    $Lines.Add("Content-Type: $ContentType")
    $Lines.Add("Accept-Ranges: bytes")
    $Lines.Add("Cache-Control: no-cache")
    $Lines.Add("Connection: close")
    foreach ($Header in $ExtraHeaders) {
        if ($Header) { $Lines.Add($Header) }
    }
    $Text = ($Lines -join "`r`n") + "`r`n`r`n"
    $Bytes = [System.Text.Encoding]::ASCII.GetBytes($Text)
    $Stream.Write($Bytes, 0, $Bytes.Length)
}

function Write-ErrorResponse(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$Reason
) {
    $Body = [System.Text.Encoding]::UTF8.GetBytes("$Status $Reason")
    Write-ResponseHeader $Stream $Status $Reason $Body.Length "text/plain; charset=utf-8" @()
    $Stream.Write($Body, 0, $Body.Length)
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$Listener.Start()
$Url = "http://127.0.0.1:$Port/?build=20260808-giroksae-timetrace-final-v1"

Write-Host "History Pieces is running at $Url"
Write-Host "Keep this window open. Press Ctrl+C to stop."
Start-Process $Url

try {
    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        $Reader = $null
        $Stream = $null
        try {
            $Stream = $Client.GetStream()
            $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
            $RequestLine = $Reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($RequestLine)) { continue }

            $RequestParts = $RequestLine.Split(" ")
            if ($RequestParts.Length -lt 2) {
                Write-ErrorResponse $Stream 400 "Bad Request"
                continue
            }

            $Method = $RequestParts[0].ToUpperInvariant()
            $Target = $RequestParts[1]
            $RequestHeaders = @{}
            while ($true) {
                $Line = $Reader.ReadLine()
                if ([string]::IsNullOrEmpty($Line)) { break }
                $Colon = $Line.IndexOf(":")
                if ($Colon -gt 0) {
                    $Name = $Line.Substring(0, $Colon).Trim().ToLowerInvariant()
                    $Value = $Line.Substring($Colon + 1).Trim()
                    $RequestHeaders[$Name] = $Value
                }
            }

            if ($Method -ne "GET" -and $Method -ne "HEAD") {
                Write-ErrorResponse $Stream 405 "Method Not Allowed"
                continue
            }

            $RawPath = $Target.Split("?")[0]
            $DecodedPath = [System.Uri]::UnescapeDataString($RawPath)
            if ($DecodedPath -eq "/") { $DecodedPath = "/index.html" }
            $RelativePath = $DecodedPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
            $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $RelativePath))

            if (-not $FullPath.StartsWith($RootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                Write-ErrorResponse $Stream 403 "Forbidden"
                continue
            }
            if ([System.IO.Directory]::Exists($FullPath)) {
                $FullPath = Join-Path $FullPath "index.html"
            }
            if (-not [System.IO.File]::Exists($FullPath)) {
                Write-ErrorResponse $Stream 404 "Not Found"
                continue
            }

            $FileInfo = [System.IO.FileInfo]::new($FullPath)
            $Start = [long]0
            $End = $FileInfo.Length - 1
            $Status = 200
            $Reason = "OK"
            $ExtraHeaders = @()

            if ($RequestHeaders.ContainsKey("range") -and $RequestHeaders["range"] -match '^bytes=(\d*)-(\d*)$') {
                $FirstText = $Matches[1]
                $LastText = $Matches[2]
                if ($FirstText) {
                    $Start = [long]$FirstText
                    if ($LastText) { $End = [long]$LastText }
                } elseif ($LastText) {
                    $SuffixLength = [long]$LastText
                    $Start = [Math]::Max([long]0, $FileInfo.Length - $SuffixLength)
                }
                $End = [Math]::Min($End, $FileInfo.Length - 1)
                if ($Start -lt 0 -or $Start -gt $End -or $Start -ge $FileInfo.Length) {
                    Write-ResponseHeader $Stream 416 "Range Not Satisfiable" 0 "text/plain; charset=utf-8" @("Content-Range: bytes */$($FileInfo.Length)")
                    continue
                }
                $Status = 206
                $Reason = "Partial Content"
                $ExtraHeaders = @("Content-Range: bytes $Start-$End/$($FileInfo.Length)")
            }

            $Length = $End - $Start + 1
            Write-ResponseHeader $Stream $Status $Reason $Length (Get-ContentType $FullPath) $ExtraHeaders
            if ($Method -eq "HEAD") { continue }

            $File = [System.IO.FileStream]::new($FullPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
            try {
                [void]$File.Seek($Start, [System.IO.SeekOrigin]::Begin)
                $Buffer = [byte[]]::new(65536)
                $Remaining = $Length
                while ($Remaining -gt 0) {
                    $Count = [int][Math]::Min([long]$Buffer.Length, $Remaining)
                    $Read = $File.Read($Buffer, 0, $Count)
                    if ($Read -le 0) { break }
                    $Stream.Write($Buffer, 0, $Read)
                    $Remaining -= $Read
                }
            } finally {
                $File.Dispose()
            }
        } catch {
            Write-Warning $_.Exception.Message
        } finally {
            if ($Reader) { $Reader.Dispose() }
            if ($Stream) { $Stream.Dispose() }
            $Client.Close()
        }
    }
} finally {
    $Listener.Stop()
}
