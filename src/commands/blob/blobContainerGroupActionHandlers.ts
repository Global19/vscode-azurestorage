/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext, registerCommand } from 'vscode-azureextensionui';
import { BlobContainerGroupTreeItem } from '../../tree/blob/BlobContainerGroupTreeItem';
import { createChildNode } from '../commonTreeCommands';

export function registerBlobContainerGroupActionHandlers(): void {
    registerCommand("azureStorage.createBlobContainer", async (context: IActionContext, treeItem?: BlobContainerGroupTreeItem) => await createChildNode(context, BlobContainerGroupTreeItem.contextValue, treeItem));
}
