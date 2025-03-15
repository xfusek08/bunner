interface ImportMetaEnv {
    BUNNER_ENTRY_POINT_DIRECTORY: string;
    // Add any other environment variables your app uses
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
