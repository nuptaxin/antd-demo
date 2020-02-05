import React, { Component } from 'react';
import { Button, Layout, Menu, Breadcrumb, Icon, Table } from 'antd';
import styles from './App.css';
import * as XLSX from 'xlsx';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      collapsed: false,
      contentVal: false,
      fileVal: true,
      originTableData: [],
      originTableHeader: [],
      tableData: [],
      tableHeader: [],
      breadCrumb: (
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>主页</Breadcrumb.Item>
          <Breadcrumb.Item>主页</Breadcrumb.Item>
        </Breadcrumb>
      ),
      selectedRowKeys: [], // Check here to configure the default column
    }
  }

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  onMenuChange = (name) => {
    if (name === "文件工具") {
      this.setState({
        contentVal: true,
        fileVal: false,
      });
    } else {
      this.setState({
        contentVal: false,
        fileVal: true,
      });
    }
    this.setState({
      breadCrumb: (
        <Breadcrumb id="breakCrumb" style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>主页</Breadcrumb.Item>
          <Breadcrumb.Item>{name}</Breadcrumb.Item>
        </Breadcrumb>
      )
    });
  }

  onImportExcel = file => {
    // 获取上传的文件对象
    const { files } = file.target;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = event => {
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: 'binary' });
        let data = []; // 存储获取到的数据
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            break; // 如果只取第一张表，就取消注释这行
          }
        }
        const excelData = data;
        const excelHeader = [];
        // 获取表头
        for (const headerAttr in excelData[0]) {
          const header = {
            title: headerAttr,
            dataIndex: headerAttr,
            key: headerAttr
          };
          excelHeader.push(header);
        }
        this.setState({
          tableData: excelData,
          tableHeader: excelHeader,
          originTableData: excelData,
          originTableHeader: excelHeader,
        })
        console.log(JSON.stringify(this.state.tableHeader));
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        console.log('文件类型不正确');
        return;
      }
    };
    if (files && files.length === 1) {
      // 以二进制方式打开文件
      fileReader.readAsBinaryString(files[0]);
    } else {
      this.setState({
        tableData: [],
        tableHeader: [],
      })
    }

  }

  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      selections: [
        {
          key: 'all-data',
          text: 'Select All Data',
          onSelect: () => {
            this.setState({
              selectedRowKeys: [...Array(46).keys()], // 0...45
            });
          },
        },
        {
          key: 'odd',
          text: 'Select Odd Row',
          onSelect: changableRowKeys => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              if (index % 2 !== 0) {
                return false;
              }
              return true;
            });
            this.setState({ selectedRowKeys: newSelectedRowKeys });
          },
        },
        {
          key: 'even',
          text: 'Select Even Row',
          onSelect: changableRowKeys => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              if (index % 2 !== 0) {
                return true;
              }
              return false;
            });
            this.setState({ selectedRowKeys: newSelectedRowKeys });
          },
        },
      ],
    };
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={['2']} mode="inline">
            <Menu.Item key="1" hidden>
              <Icon type="pie-chart" />
              <span>Option 1</span>
            </Menu.Item>
            <Menu.Item key="2" onClick={() => this.onMenuChange("主页")}>
              <Icon type="desktop" />
              <span >主页</span>
            </Menu.Item>
            <SubMenu
              key="sub1"
              title={
                <span>
                  <Icon type="user" />
                  <span>User</span>
                </span>
              }
              hidden>
              <Menu.Item key="3">Tom</Menu.Item>
              <Menu.Item key="4">Bill</Menu.Item>
              <Menu.Item key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu
              key="sub2"
              title={
                <span>
                  <Icon type="team" />
                  <span>Team</span>
                </span>
              }
              hidden>
              <Menu.Item key="6">Team 1</Menu.Item>
              <Menu.Item key="8">Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item key="9" onClick={() => this.onMenuChange("文件工具")}>
              <Icon type="file" />
              <span>文件工具</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }} />
          <Content style={{ margin: '0 16px' }}>
            {this.state.breadCrumb}
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }} hidden={this.state.contentVal}>
              欢迎楚楚小可爱
            </div>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }} hidden={this.state.fileVal}>
              <Icon type='upload' />
              <input className={styles['file-uploader']} type='file' accept='.xlsx, .xls' onChange={this.onImportExcel} />
              <span className={styles['upload-text']} hidden>上传文件</span>
              <p className={styles['upload-tip']}>支持 .xlsx、.xls 格式的文件</p>
              <Table rowSelection={rowSelection} columns={this.state.tableHeader} dataSource={this.state.tableData} />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
      </Layout >
    );
  }
}

export default App;
