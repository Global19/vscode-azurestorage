/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { reporter } from '../../telemetry/reporter';
export class UserCancelledError extends Error { }

export abstract class BaseActionHandler {
    abstract registerActions(context: vscode.ExtensionContext);

    initCommand(context: vscode.ExtensionContext, commandId: string, callback: (...args: any[]) => any) {
        this.initAsyncCommand(context, commandId, (...args: any[]) => Promise.resolve(callback(...args)));
    }
    
    initAsyncCommand(context: vscode.ExtensionContext, commandId: string, callback: (...args: any[]) => Promise<any>) {
        context.subscriptions.push(vscode.commands.registerCommand(commandId, async (...args: any[]) => {
            const start = Date.now();
            let result = 'Succeeded';
            let errorData: string = '';
    
            try {
                await callback(...args);
            } catch (err) {
                if (err instanceof UserCancelledError) {
                    result = 'Canceled';
                } else {
                    result = 'Failed';
                    errorData = this.errToString(err);
                    vscode.window.showErrorMessage(errorData);
                    throw err;
                }
            } finally {
                const end = Date.now();
                this.sendTelemetry(commandId, { result: result, error: errorData }, { duration: (end - start) / 1000 });
            }
        }));
    }

    sendTelemetry(eventName: string, properties?: { [key: string]: string; }, measures?: { [key: string]: number; }) {
            if (reporter) {
                reporter.sendTelemetryEvent(eventName, properties, measures);
            }
        }
        
    errToString(error: any): string {
            if (error === null || error === undefined) {
                return '';
            }
        
            if (error instanceof Error) {
                try {
                    // errors from Azure come as JSON string
                    return JSON.stringify({
                        'Error': JSON.parse(error.message).Code,
                        'Message': JSON.parse(error.message).Message
                    });
        
                } catch (error) {
                    return JSON.stringify({
                        'Error': error.constructor.name,
                        'Message': error.message
                    });
                }
        
            }
        
            if (typeof (error) === 'object') {
                return JSON.stringify({
                    'object': error.constructor.name
                });
            }
        
            return error.toString();
        }
}
