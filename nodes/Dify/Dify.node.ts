import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeApiError } from 'n8n-workflow';

export class Dify implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dify',
		name: 'dify',
		icon: 'file:dify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Dify API と連携してチャット・ワークフロー・テキスト補完・アプリ情報取得を行う',
		defaults: {
			name: 'Dify',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'difyApi',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// --- オペレーション選択 ---
			{
				displayName: 'オペレーション',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'チャットメッセージ送信',
						value: 'chatMessage',
						description: 'チャットアプリにメッセージを送信する',
						action: 'チャットメッセージを送信',
					},
					{
						name: 'ワークフロー実行',
						value: 'runWorkflow',
						description: 'ワークフローを実行する',
						action: 'ワークフローを実行',
					},
					{
						name: 'テキスト補完',
						value: 'textCompletion',
						description: 'テキスト補完アプリにリクエストを送信する',
						action: 'テキスト補完を実行',
					},
					{
						name: 'アプリ情報取得',
						value: 'getAppInfo',
						description: 'アプリケーションの情報を取得する',
						action: 'アプリ情報を取得',
					},
				],
				default: 'chatMessage',
			},

			// --- chatMessage パラメータ ---
			{
				displayName: 'クエリ',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['chatMessage'],
					},
				},
				description: 'チャットに送信するメッセージ',
			},
			{
				displayName: 'ユーザー ID',
				name: 'user',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['chatMessage', 'runWorkflow', 'textCompletion'],
					},
				},
				description: 'エンドユーザーを識別するための一意の ID',
			},
			{
				displayName: '入力変数 (JSON)',
				name: 'inputs',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['chatMessage', 'runWorkflow', 'textCompletion'],
					},
				},
				description: 'アプリで定義された入力変数を JSON 形式で指定する',
			},
			{
				displayName: '会話 ID',
				name: 'conversationId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['chatMessage'],
					},
				},
				description:
					'既存の会話を継続する場合に指定する。空の場合は新しい会話が開始される。',
			},

			// --- textCompletion パラメータ ---
			{
				displayName: 'クエリ',
				name: 'completionQuery',
				type: 'string',
				default: '',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['textCompletion'],
					},
				},
				description: 'テキスト補完に送信するクエリ（任意）',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('difyApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: unknown;

				if (operation === 'chatMessage') {
					const query = this.getNodeParameter('query', i) as string;
					const user = this.getNodeParameter('user', i) as string;
					const inputsRaw = this.getNodeParameter('inputs', i, '{}') as string;
					const conversationId = this.getNodeParameter('conversationId', i, '') as string;

					const inputs = typeof inputsRaw === 'string' ? JSON.parse(inputsRaw) : inputsRaw;

					const body: Record<string, unknown> = {
						query,
						user,
						inputs,
						response_mode: 'blocking',
					};

					if (conversationId) {
						body.conversation_id = conversationId;
					}

					const options: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/chat-messages`,
						body,
						json: true,
					};

					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'difyApi',
						options,
					);
				} else if (operation === 'runWorkflow') {
					const user = this.getNodeParameter('user', i) as string;
					const inputsRaw = this.getNodeParameter('inputs', i, '{}') as string;

					const inputs = typeof inputsRaw === 'string' ? JSON.parse(inputsRaw) : inputsRaw;

					const body: Record<string, unknown> = {
						inputs,
						user,
						response_mode: 'blocking',
					};

					const options: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/workflows/run`,
						body,
						json: true,
					};

					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'difyApi',
						options,
					);
				} else if (operation === 'textCompletion') {
					const user = this.getNodeParameter('user', i) as string;
					const inputsRaw = this.getNodeParameter('inputs', i, '{}') as string;
					const completionQuery = this.getNodeParameter('completionQuery', i, '') as string;

					const inputs = typeof inputsRaw === 'string' ? JSON.parse(inputsRaw) : inputsRaw;

					const body: Record<string, unknown> = {
						inputs,
						user,
						response_mode: 'blocking',
					};

					if (completionQuery) {
						body.query = completionQuery;
					}

					const options: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/completion-messages`,
						body,
						json: true,
					};

					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'difyApi',
						options,
					);
				} else if (operation === 'getAppInfo') {
					const options: IHttpRequestOptions = {
						method: 'GET',
						url: `${baseUrl}/info`,
						json: true,
					};

					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'difyApi',
						options,
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
