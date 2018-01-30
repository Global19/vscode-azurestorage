/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Uri, window } from 'vscode';
import { StorageAccount, StorageAccountKey } from '../../../node_modules/azure-arm-storage/lib/models';
import * as azureStorage from "azure-storage";
import * as path from 'path';
import { IAzureTreeItem, IAzureNode, UserCancelledError } from 'vscode-azureextensionui';
import { DialogBoxResponses } from '../../constants';

export class TableNode implements IAzureTreeItem {
    constructor(
        public readonly tableName: string,
        public readonly storageAccount: StorageAccount,
        public readonly key: StorageAccountKey) {
    }

    public id: string = undefined;
    public label: string = this.tableName;
    public contextValue: string = 'azureTable';
    public iconPath: { light: string | Uri; dark: string | Uri } = {
        light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'light', 'AzureTable_16x.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'dark', 'AzureTable_16x.svg')
    };

    public async deleteTreeItem(_node: IAzureNode): Promise<void> {
        const message: string = `Are you sure you want to delete table '${this.label}' and all its contents?`;
        const result = await window.showWarningMessage(message, DialogBoxResponses.Yes, DialogBoxResponses.Cancel);
        if (result === DialogBoxResponses.Yes) {
            const tableService = azureStorage.createTableService(this.storageAccount.name, this.key.value);
            await new Promise((resolve, reject) => {
                tableService.deleteTable(this.tableName, function (err) {
                    err ? reject(err) : resolve();
                });
            });
        } else {
            throw new UserCancelledError();
        }
    }
}
