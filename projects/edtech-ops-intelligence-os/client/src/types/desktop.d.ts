interface Window {
  desktopAPI?: {
    getState: () => Promise<any>;
    changeRole: (role: string) => Promise<any>;
    create: (entity: string, payload: Record<string, any>) => Promise<any>;
    update: (entity: string, id: string, patch: Record<string, any>) => Promise<any>;
    remove: (entity: string, id: string) => Promise<any>;
    addSopVersion: (id: string, payload: Record<string, any>) => Promise<any>;
    generateReportSnapshot: (id: string, schedule?: string) => Promise<any>;
    resolveImportRun: (sourceId: string, runId: string, remediation: string) => Promise<any>;
    profileStudentDataset: (name: string, csvText: string) => Promise<any>;
    commitStudentDataset: (datasetId: string) => Promise<any>;
    prepareSessionEvaluation: (sessionId: string, rubricId: string) => Promise<any>;
    generateBusinessReview: (period: string) => Promise<any>;
    requestAnalystRun: (payload: { question: string; scope: string }) => Promise<any>;
    validateIntegration: (id: string) => Promise<any>;
    queueIntegrationSync: (id: string) => Promise<any>;
    runGuardedIntegrationSync: (id: string) => Promise<any>;
    resolveReconciliation: (id: string, resolution: string) => Promise<any>;
    runAutomation: (id: string, overrideNote?: string) => Promise<any>;
    recordSecurityAuditExport: (id: string) => Promise<any>;
    generateDiagnosticsBundle: (id: string) => Promise<any>;
    importStudents: (csvText: string) => Promise<{ created: number; duplicates: number; errors: string[] }>;
    exportCsv: (payload: { filename: string; entityType: string; rows: Record<string, any>[] }) => Promise<{ saved: boolean; filePath?: string }>;
    resetDemo: () => Promise<any>;
    openExternal: (target: string) => Promise<void>;
  };
}
