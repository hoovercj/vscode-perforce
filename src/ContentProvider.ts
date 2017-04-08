import { workspace, Uri, Disposable, Event, EventEmitter } from 'vscode';
import { Utils } from './Utils';
import { Display } from './Display';

export class PerforceContentProvider {
    private onDidChangeEmitter = new EventEmitter<Uri>();
    get onDidChange(): Event<Uri> { return this.onDidChangeEmitter.event; }

    private disposables: Disposable[] = [];
    dispose(): void { this.disposables.forEach(d => d.dispose()); }

    private compatibilityMode: string;

    constructor(compaitiblityMode: string) {
        this.compatibilityMode = compaitiblityMode;
        this.disposables.push(
            workspace.registerTextDocumentContentProvider('perforce', this),
        );
    }

    public provideTextDocumentContent(uri: Uri): Promise<string> {
        return Utils.isLoggedIn(this.compatibilityMode).then(value => {
            if (!value) {
                return '';
            }

            let command: string = uri.authority;
            let file: Uri = uri.fsPath ? Uri.file(uri.fsPath) : null;
            let revision: number = parseInt(uri.fragment);
            let args: string = decodeURIComponent(uri.query);

            return Utils.getOutput(command, file, revision, args);
            
        }).catch(reason => {
            Display.showError(reason.toString());
            return '';
        })
    }
}