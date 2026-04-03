Add-Type -AssemblyName System.Drawing

function New-RoundedRectanglePath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2

  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function New-ArrowHeadPoints {
  param(
    [float]$CenterX,
    [float]$CenterY,
    [float]$AngleDegrees,
    [float]$Size
  )

  $radians = [Math]::PI * $AngleDegrees / 180
  $cos = [Math]::Cos($radians)
  $sin = [Math]::Sin($radians)

  $points = @(
    @{ X = $Size * 0.95; Y = 0 },
    @{ X = -$Size * 0.75; Y = $Size * 0.58 },
    @{ X = -$Size * 0.75; Y = -$Size * 0.58 }
  )

  return $points | ForEach-Object {
    New-Object System.Drawing.PointF(
      [float]($CenterX + $_.X * $cos - $_.Y * $sin),
      [float]($CenterY + $_.X * $sin + $_.Y * $cos)
    )
  }
}

function Get-EllipsePoint {
  param(
    [System.Drawing.RectangleF]$Rect,
    [float]$AngleDegrees
  )

  $radians = [Math]::PI * $AngleDegrees / 180
  $centerX = $Rect.X + $Rect.Width / 2
  $centerY = $Rect.Y + $Rect.Height / 2

  return New-Object System.Drawing.PointF(
    [float]($centerX + [Math]::Cos($radians) * $Rect.Width / 2),
    [float]($centerY + [Math]::Sin($radians) * $Rect.Height / 2)
  )
}

function Save-PngWrappedIco {
  param(
    [string]$PngPath,
    [string]$IcoPath,
    [int]$Width,
    [int]$Height
  )

  $pngBytes = [System.IO.File]::ReadAllBytes($PngPath)
  $stream = [System.IO.File]::Create($IcoPath)
  $writer = New-Object System.IO.BinaryWriter($stream)

  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]1)
  $writer.Write([byte]$Width)
  $writer.Write([byte]$Height)
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$pngBytes.Length)
  $writer.Write([UInt32]22)
  $writer.Write($pngBytes)
  $writer.Flush()
  $writer.Dispose()
  $stream.Dispose()
}

function New-BrandIcon {
  param(
    [int]$Size,
    [string]$OutputPath
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $navy = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
  $mint = [System.Drawing.ColorTranslator]::FromHtml("#70F0CB")

  $margin = [float]($Size * 0.07)
  $squareSize = [float]($Size - ($margin * 2))
  $radius = [float]($squareSize * 0.26)
  $backgroundPath = New-RoundedRectanglePath -X $margin -Y $margin -Width $squareSize -Height $squareSize -Radius $radius

  $backgroundBrush = New-Object System.Drawing.SolidBrush($navy)
  $graphics.FillPath($backgroundBrush, $backgroundPath)

  $strokeWidth = [float]($Size * 0.11)
  $pen = New-Object System.Drawing.Pen($mint, $strokeWidth)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $arcRect = New-Object System.Drawing.RectangleF(
    [float]($Size * 0.25),
    [float]($Size * 0.25),
    [float]($Size * 0.5),
    [float]($Size * 0.5)
  )

  $graphics.DrawArc($pen, $arcRect, 205, 150)
  $graphics.DrawArc($pen, $arcRect, 25, 150)

  $arrowBrush = New-Object System.Drawing.SolidBrush($mint)
  $firstPoint = Get-EllipsePoint -Rect $arcRect -AngleDegrees 355
  $secondPoint = Get-EllipsePoint -Rect $arcRect -AngleDegrees 175

  $graphics.FillPolygon($arrowBrush, (New-ArrowHeadPoints -CenterX $firstPoint.X -CenterY $firstPoint.Y -AngleDegrees 85 -Size ($Size * 0.06)))
  $graphics.FillPolygon($arrowBrush, (New-ArrowHeadPoints -CenterX $secondPoint.X -CenterY $secondPoint.Y -AngleDegrees 265 -Size ($Size * 0.06)))

  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $arrowBrush.Dispose()
  $pen.Dispose()
  $backgroundBrush.Dispose()
  $backgroundPath.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot

$iconPath = Join-Path $root "src\\app\\icon.png"
$appleIconPath = Join-Path $root "src\\app\\apple-icon.png"
$faviconPngPath = Join-Path $root "src\\app\\favicon-64.png"
$faviconIcoPath = Join-Path $root "src\\app\\favicon.ico"
$manifest192Path = Join-Path $root "public\\icons\\icon-192.png"
$manifest512Path = Join-Path $root "public\\icons\\icon-512.png"

New-BrandIcon -Size 512 -OutputPath $iconPath
New-BrandIcon -Size 180 -OutputPath $appleIconPath
New-BrandIcon -Size 64 -OutputPath $faviconPngPath
New-BrandIcon -Size 192 -OutputPath $manifest192Path
New-BrandIcon -Size 512 -OutputPath $manifest512Path
Save-PngWrappedIco -PngPath $faviconPngPath -IcoPath $faviconIcoPath -Width 64 -Height 64

Remove-Item -LiteralPath $faviconPngPath
