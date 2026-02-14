// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, ConfigProvider, Layout, theme } from "antd"
import 'antd/dist/reset.css'
import './index.css'
import DataTable from "./DataTable.tsx";

const { Header, Content, Footer } = Layout

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
      <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
          <App>
              <Layout style={{height: '100vh'}}>
                  <Header>Header</Header>
                  <Content style={{position: 'relative'}}>
                      <DataTable/>
                      {/*<MolstarViewer/>*/}
                  </Content>
                  <Footer>Footer</Footer>
              </Layout>
          </App>
      </ConfigProvider>
  // </StrictMode>,
)
