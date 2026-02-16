import {App, Button, ConfigProvider, Layout, theme} from 'antd'
import DataTable from './DataTable.tsx'
import {useEffect, useState} from 'react'
import {MoonOutlined, SunOutlined} from '@ant-design/icons'


const Main = () => {

    const [darkMode, setDarkMode] = useState(typeof window !== 'undefined' && (window.localStorage.theme === 'dark' || (!('theme' in window.localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)))

    useEffect(() => {
        window.localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    }, [darkMode]);

    return (
        <ConfigProvider theme={{algorithm: darkMode ? theme.darkAlgorithm : undefined}}>
            <App>
                <Layout style={{minHeight: '100vh'}}>
                    <Layout.Header>
                        <Button
                            variant='filled'
                            icon={darkMode ? <SunOutlined/> : <MoonOutlined/>}
                            onClick={() => {setDarkMode(!darkMode)}}
                        />
                    </Layout.Header>
                    <Layout.Content>
                        <DataTable darkMode={darkMode}/>
                    </Layout.Content>
                </Layout>
            </App>
        </ConfigProvider>
    )
}

export default Main