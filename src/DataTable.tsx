import {LoadingOutlined, PercentageOutlined} from '@ant-design/icons'
import {Button, Flex, Input, InputNumber, Progress, Result, Spin, Table, Tag} from 'antd'
import Papa, {type ParseResult} from 'papaparse'
import {useEffect, useRef, useState} from 'react'
import _, {camelCase} from 'lodash'
import type {PredictionDetails} from "./types.ts";
import type {InputRef, TableColumnType} from 'antd'
import type {InputNumberRef} from '@rc-component/input-number'
import MolstarViewer from "./MolstarViewer.tsx";

const percentageColors = [
    '#FF0000',
    '#FF4000',
    '#FF8000',
    '#FFBF00',
    '#FFFF00',
    '#D4FF00',
    '#AAFF00',
    '#55FF00'
]

const renderProbabilityView = (value: number) =>
    <Progress percent={value} steps={10} size='small' strokeColor={percentageColors[Math.min(7, Math.round(value / 10))]}/>

const renderMahomesView = (_: unknown, details: PredictionDetails) =>
    <Flex gap='large'>
        {details.mahomes2Prediction ?
            <Tag style={{width: 100, textAlign: 'center'}} variant='outlined' color='green'>Catalytic</Tag> :
            <Tag style={{width: 100, textAlign: 'center'}} variant='outlined' color='red'>Not Catalytic</Tag>}
        {renderProbabilityView(details.mahomes2ProbCatalytic)}
    </Flex>

const DataTable = () => {

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [data, setData] = useState<PredictionDetails[]>(null as unknown as PredictionDetails[])
    const [modalDetails, setModalDetails] = useState<PredictionDetails | null>(null)

    const structureIdSearchInput = useRef<InputRef>(null)
    const minProbabilityInput = useRef<InputNumberRef>(null)

    useEffect(() => {

        Papa.parse('data.csv', {
            download: true,
            header: true,
            delimiter: ',',
            skipEmptyLines: true,
            transformHeader: camelCase,
            transform: (value: string, header: string) => {
                switch(header) {
                    case 'predZnCoord':
                        return value.split(',').map(parseFloat)
                    case 'zincsightProb':
                    case 'mahomes2ProbCatalytic':
                        return parseFloat(value)
                    case 'mahomes2Prediction':
                        return value === 'Catalytic'
                }
                return value
            },
            complete: ({data, errors}: ParseResult<PredictionDetails>) => {
                if (errors.length > 0) {
                    setError(true)
                } else {
                    data = data.map((row) => ({...row, key: `${row['structureId']}.${row['pdbZnResseq']}`}))
                    setData(data)
                }
                setLoading(false)
            }
        })
    }, [])

    if(loading) {
        return (
            <Flex justify="center" align="center" style={{height: '100vh'}}>
                <Spin indicator={<LoadingOutlined style={{fontSize: 96}} spin/>}/>
            </Flex>
        )
    }

    if(error) {
        return(
            <Flex justify="center" align="center" style={{height: '100vh'}}>
                <Result status='error' title='Data temporarily unavailable'/>
            </Flex>
        )
    }

    const columns: TableColumnType<PredictionDetails>[] = [
        {
            key: 'structureId',
            dataIndex: 'structureId',
            title: 'Structure',
            filterDropdown: ({confirm, setSelectedKeys}) =>
                <div style={{padding: 10}}>
                    <Input.Search
                        ref={structureIdSearchInput} placeholder="Enter structure identifier"
                        onSearch={value => {
                            setSelectedKeys(value.trim() ? [value] : [])
                            confirm()
                        }}
                    />
                </div>,
            onFilter: (value, record) =>
                record.structureId.toLowerCase() === (value as string).trim().toLowerCase(),
            filterDropdownProps: {
                onOpenChange: open => {
                    if(open) {
                        setTimeout(() => structureIdSearchInput.current?.select(), 100)
                    }
                }
            }
        },
        {
            key: 'ligandResiType',
            dataIndex: 'ligandResiType',
            title: 'Binding Residues',
            filters: _(data).map('ligandResiType').uniq().sortedUniq().map(value => ({value, text: value})).value(),
            onFilter: (value, record) => record.ligandResiType === value
        },
        {
            key: 'zincsightProb',
            dataIndex: 'zincsightProb',
            title: 'ZincSight Probability', render: renderProbabilityView,
            filterDropdown: ({confirm, setSelectedKeys}) =>
                <div style={{padding: 10}}>
                    <InputNumber
                        ref={minProbabilityInput}
                        style={{width: 120}}
                        defaultValue={0}
                        min={0}
                        max={100}
                        placeholder="Minimum"
                        suffix={<PercentageOutlined/>}
                        onPressEnter={() => {
                            setSelectedKeys(minProbabilityInput.current!.value ? [parseFloat(minProbabilityInput.current!.value)] : [])
                            confirm()
                        }}
                    />
                </div>,
            onFilter: (value, record) =>
                record.zincsightProb >= (value as number),
            filterDropdownProps: {
                onOpenChange: open => {
                    if(open) {
                        setTimeout(() => minProbabilityInput.current?.select(), 100)
                    }
                }
            }
        },
        {
            key: 'mahomes2Prediction',
            dataIndex: 'mahomes2Prediction',
            title: 'MAHOMES II Catalytic Prediction',
            render: renderMahomesView,
            filters: [{value: true, text: 'Catalytic'}, {value: false, text: 'Not Catalytic'}],
            onFilter: (value, record) => record.mahomes2Prediction === value
        },
        {
            key: 'actions',
            render: (_: unknown, details: PredictionDetails) =>
                <Button onClick={() => setModalDetails(details)}>3D View</Button>
        }
    ]

    return(
        <>
            <Table columns={columns} dataSource={data}/>
            <MolstarViewer details={modalDetails} onClose={() => setModalDetails(null)}/>
        </>
    )
}

export default DataTable