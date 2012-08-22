function create-nuspec($name) {    
    $spec = get-text "$name\$name.nuspec"
    $spec = $spec.Replace("#version#", (get-version("bin\release\$name.dll")))
    $spec = $spec.Replace("#message#", (get-text(".git\COMMIT_EDITMSG")))
    
    $spec | out-file "$name\bin\Package\$name.nuspec"
}

function get-text($file) {
    return [string]::join([environment]::newline, (get-content -path $file))
}

function get-version($file) {
    $file = [system.io.path]::combine([environment]::currentdirectory, $file)
    return [System.Diagnostics.FileVersionInfo]::GetVersionInfo($file).FileVersion
}

function create-package($name){
  del "$name\bin\Package" -recurse
  md "$name\bin\Package\lib\net40" 
  copy "$name\bin\Release\*.*" "$name\bin\Package\lib\net40"
  create-nuspec($name)
  .nuget\NuGet.exe pack "$name\bin\Package\$name.nuspec" /o "$name\bin\Package"
}

create-package CalDav