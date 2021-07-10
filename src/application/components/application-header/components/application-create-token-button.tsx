import { Button, Col, Drawer, Form, Input, Row, Select, Space, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { TokenCard } from '../../../../modules/token/components/token-card/token-card';
import { StateType, DEFAULT_GAS_PRECISION } from '../../../../wallet';
import { NFT } from '../../../../wallet/interfaces/nft';
import Icon from '@ant-design/icons';
import { CloseIcon } from '../../../../common/icons/close-icon';

export const ApplicationCreateTokenButton = React.memo(function ApplicationCreateTokenButton({
	onLoadNFT,
	onCreateToken,
}: {
	onLoadNFT: (nftScriptHash: string, nftTokenId: string) => Promise<NFT | null>;
	onCreateToken: (nftScriptHash: string, nftTokenId: string, price: number, duration: number) => Promise<void>;
}) {
	// The rent object built when inserting the data into the form with default values
	const [rent, setRent] = useState({
		tokenId: '',
		owner: '',
		tenant: null,
		nftScriptHash: '',
		nftTokenId: '',
		price: 0,
		balance: 0,
		amount: 0,
		state: StateType.Open,
		duration: 0,
		createdOn: 0,
		rentedOn: 0,
		closedOn: 0,
	});
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [loading, setLoading] = useState(false);

	const [form] = Form.useForm();
	const onSubmit = useCallback(
		async (values) => {
			setLoading(true);
			await onCreateToken(values.nftScriptHash, values.nftTokenId, values.price, values.duration);

			setLoading(false);
			setDrawerVisible(false);

			// Clear fields for next time
			form.resetFields();
		},
		[form, onCreateToken],
	);
	const onValuesChange = useCallback((changedValues: any, values: any) => {
		// Normalize scripthash if needed
		let scriptHash = values.nftScriptHash || '';
		if (scriptHash.length === 42) {
			// Remove leading '0x'
			scriptHash = scriptHash.substring(2);
		}

		setRent(_rent => (
			{
				..._rent, 
				nftScriptHash: scriptHash, 
				nftTokenId: values.nftTokenId || '',
				price: values.price !== undefined ? (Math.ceil(Number(+values.price) * DEFAULT_GAS_PRECISION)) : 0,
				duration: values.duration !== undefined ? (+values.duration * (1000 * 60 * 60 * 24)) : 0
			}
		));
	}, []);

	// This way to prevent continous nft loading when writing
	const _onLoadNFT = useCallback(async(nftScriptHash: string, nftTokenId: string)=> {
		// Only when at least full scripthash inserted
		if (nftScriptHash.length === 40 && nftTokenId.length) {
			return await onLoadNFT(nftScriptHash, nftTokenId);
		}
		return null;
	}, [onLoadNFT]);

	return (
		<div>
			<Button type={'primary'} size={'large'} shape={'round'} onClick={() => setDrawerVisible(true)}>
				{'Lend NFT'}
			</Button>

			<Drawer
				title={<Typography.Text strong={true}>{'Lend NFT'}</Typography.Text>}
				width={720}
				closeIcon={<Icon component={CloseIcon} />}
				onClose={() => setDrawerVisible(false)}
				visible={drawerVisible}
				bodyStyle={{ paddingBottom: 80 }}
				footer={
					<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
						<Space size={24} align={'end'}>
							<Button onClick={() => setDrawerVisible(false)} disabled={loading}>
								{'Cancel'}
							</Button>
							<Button onClick={() => form.submit()} type={'primary'} loading={loading}>
								{'Lend'}
							</Button>
						</Space>
					</div>
				}
			>
				<Row gutter={24}>
					<Col span={12}>
						<TokenCard rent={rent} onLoadNFT={_onLoadNFT} />
					</Col>

					<Col span={12}>
						<Form form={form} layout={'vertical'} onFinish={onSubmit} onValuesChange={onValuesChange}>
							<Form.Item
								name={'nftScriptHash'}
								label={<Typography.Text strong={true}>{'NFT script hash'}</Typography.Text>}
								rules={[{ required: true, message: '' }]}
							>
								<Input autoFocus={true} size={'large'} />
							</Form.Item>

							<Form.Item
								name={'nftTokenId'}
								label={<Typography.Text strong={true}>{'NFT token id'}</Typography.Text>}
								rules={[{ required: true, message: '' }]}
							>
								<Input size={'large'} />
							</Form.Item>

							<Form.Item
								name={'price'}
								label={<Typography.Text strong={true}>{'Price [GAS/day]'}</Typography.Text>}
								rules={[{ required: true, message: '' }]}
							>
								<Input type={'number'} size={'large'} />
							</Form.Item>

							<Form.Item
								name={'duration'}
								label={<Typography.Text strong={true}>{'Duration [day]'}</Typography.Text>}
								rules={[{ required: true, message: '' }]}
							>
								<Input type={'number'} size={'large'} />
							</Form.Item>
						</Form>
					</Col>
				</Row>
			</Drawer>

			<style jsx>{``}</style>
		</div>
	);
});
