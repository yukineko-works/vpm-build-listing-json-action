export type VRCPackages = {
    name: string
    author: string
    url: string
    id: string
    packages: Record<string, VRCPackage>
}

export type VRCPackage = {
    versions: Record<string, Artifact>
}

export type Artifact = {
    name: string
    displayName: string
    version: string
    description: string
    gitDependencies?: Record<string, string>
    vpmDependencies?: Record<string, string>
    author: {
        name: string
        email: string
        url?: string
    }
    zipSHA256: string
    url: string
    legacyFolders: Record<string, string>
    legacyFiles: Record<string, string>
    unity?: string
}
