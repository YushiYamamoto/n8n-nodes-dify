import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class DifyApi implements ICredentialType {
	name = 'difyApi';

	displayName = 'Dify API';

	icon: Icon = 'file:../nodes/Dify/dify.svg';

	documentationUrl = 'https://docs.dify.ai/guides/application-publishing/developing-with-apis';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Dify アプリケーションの API キー',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.dify.ai/v1',
			required: true,
			description:
				'Dify API のベース URL。セルフホスト環境の場合は変更してください。末尾にスラッシュを含めないでください。',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/info',
			method: 'GET',
		},
	};
}
