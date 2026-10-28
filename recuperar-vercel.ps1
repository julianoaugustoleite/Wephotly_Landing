$deploymentId = "dpl_EC95TbJfnioQ1d6aitPEZFxf8ztv"

Write-Host "Lendo arquivos do deployment..."

$treeJson = vercel api "/v6/deployments/$deploymentId/files" --method GET
$treeParsed = $treeJson | ConvertFrom-Json

# A CLI pode retornar diretamente o array ou envolver em "result"
if ($treeParsed.result) {
    $tree = $treeParsed.result
} else {
    $tree = $treeParsed
}

function Download-Items($items, $basePath = "") {

    foreach ($item in $items) {

        $relativePath = if ($basePath) {
            "$basePath/$($item.name)"
        } else {
            $item.name
        }

        if ($item.type -eq "directory") {

            New-Item -ItemType Directory -Force -Path $relativePath | Out-Null

            Download-Items $item.children $relativePath
            continue
        }

        if ($item.type -eq "file") {

            Write-Host "Baixando $relativePath"

            $parent = Split-Path $relativePath -Parent

            if ($parent) {
                New-Item -ItemType Directory -Force -Path $parent | Out-Null
            }

            try {

                $contentJson = vercel api "/v8/deployments/$deploymentId/files/$($item.uid)" --method GET

                $contentObject = $contentJson | ConvertFrom-Json

                $base64 = $null

                # Formato possível 1:
                # { "data": "..." }
                if ($contentObject.data) {
                    $base64 = $contentObject.data
                }

                # Formato possível 2:
                # { "result": { "data": "..." } }
                elseif ($contentObject.result -and $contentObject.result.data) {
                    $base64 = $contentObject.result.data
                }

                # Formato possível 3:
                # { "content": "..." }
                elseif ($contentObject.content) {
                    $base64 = $contentObject.content
                }

                if ($base64) {

                    $bytes = [Convert]::FromBase64String($base64)

                    $fullPath = Join-Path (Get-Location) $relativePath

                    [System.IO.File]::WriteAllBytes(
                        $fullPath,
                        $bytes
                    )

                    Write-Host "OK: $relativePath" -ForegroundColor Green

                } else {

                    Write-Warning "Conteúdo não encontrado para $relativePath"

                    Write-Host "Resposta recebida:"
                    Write-Host $contentJson
                }

            }
            catch {

                Write-Warning "Erro ao baixar $relativePath"
                Write-Warning $_
            }
        }
    }
}

Download-Items $tree

Write-Host ""
Write-Host "Recuperação concluída." -ForegroundColor Green