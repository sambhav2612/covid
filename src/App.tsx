import React, {useEffect, useRef, useState} from 'react';
import {getDashboardData} from "./utils";
import {Button, Card, Col, Input, Layout, Row, Space, Statistic, Table} from "antd";
import {ArrowUpOutlined, SearchOutlined} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

import ReactFC from "react-fusioncharts";
import FusionCharts from "fusioncharts";
import Pie2D from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

import 'antd/dist/antd.min.css';
import './App.css';

ReactFC.fcRoot(FusionCharts, Pie2D, FusionTheme);

function App() {
  const searchInput = useRef(null);
  const [searchState, setSearchState] = useState({
    searchText: '',
    searchedColumn: ''
  });
  const [overallData, setOverallData] = useState<object | undefined>({});
  const [tableSource, setTableSource] = useState<object[]>([]);

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    // @ts-ignore
    setSearchState({
      searchText: '',
      searchedColumn: ''
    });
  };

  const getColumnSearchProps = (dataIndex: any) => ({
    // @ts-ignore
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
      <div style={{padding: 8}}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{width: 188, marginBottom: 8, display: 'block'}}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined/>}
            size="small"
            style={{width: 90}}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{width: 90}}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        // @ts-ignore
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text: any) =>
      searchState.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
          searchWords={[searchState.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
      sorter: (a: any, b: any) => a.name.length - b.name.length,
      ...getColumnSearchProps('name'),
    }, {
      key: 'confirmed',
      dataIndex: 'confirmed',
      title: 'Confirmed',
      sorter: (a: any, b: any) => a.confirmed - b.confirmed,
    }, {
      key: 'recovered',
      dataIndex: 'recovered',
      title: 'Recovered',
      sorter: (a: any, b: any) => a.recovered - b.recovered,
    }, {
      key: 'deaths',
      dataIndex: 'deaths',
      title: 'Deaths',
      sorter: (a: any, b: any) => a.deaths - b.deaths,
    }
  ];

  useEffect(() => {
    (async () => {
      const overall = (await getDashboardData())?.overall;
      const dataSource = (await getDashboardData())?.dataSource;
      setOverallData(overall);
      // @ts-ignore
      setTableSource(dataSource);
    })()
  }, []);

  const gridStyle = {
    width: '100%',
    textAlign: 'center',
  };

  return (
    <Layout className="layout">
      <Layout.Content style={{padding: 24}}>
        <Row gutter={[8, 8]}>
          <Col span={12} className="column">
            <Card title="Cases At A Glance" className="column">
              <Row gutter={[8, 8]}>
                <Col span={10}>
                  {/*// @ts-ignore*/}
                  <Card style={gridStyle}>
                    <Statistic
                      title="Total Cases"
                      // @ts-ignore
                      value={overallData?.cases || 0}
                      valueStyle={{color: '#1a3f86'}}
                      prefix={<ArrowUpOutlined/>}
                    />
                  </Card>
                  {/*// @ts-ignore*/}
                  <Card style={gridStyle} size="small">
                    <Statistic
                      title="Active Cases"
                      // @ts-ignore
                      value={overallData?.active || 0}
                      valueStyle={{color: '#3f8600'}}
                      prefix={<ArrowUpOutlined/>}
                    />
                  </Card>
                  {/*// @ts-ignore*/}
                  <Card style={gridStyle} size="small">
                    <Statistic
                      title="Recovered Cases"
                      // @ts-ignore
                      value={overallData?.recovered || 0}
                      valueStyle={{color: '#e68900'}}
                      prefix={<ArrowUpOutlined/>}
                    />
                  </Card>
                  {/*// @ts-ignore*/}
                  <Card style={gridStyle} size="small">
                    <Statistic
                      title="Deaths"
                      // @ts-ignore
                      value={overallData?.deaths || 0}
                      valueStyle={{color: '#f86005'}}
                      prefix={<ArrowUpOutlined/>}
                    />
                  </Card>
                </Col>
                <Col span={14}>
                  <ReactFC type="pie2d" width="340" dataFormat="json" dataSource={{
                    chart: {
                      caption: "COVID-19 Reported Cases",
                      subCaption: "In M = One Million Cases",
                      xAxisName: "Type",
                      yAxisName: "Cases (M)",
                      theme: "fusion",
                      showPercentValues: 1,
                      decimals: 1,
                      useDataPlotColorForLabels: 1,
                      showLabels: 1,
                      showPrintMenuItem: 1,
                      plottooltext: '$label, $value',
                      enableSmartLabels: 1,
                      showBorder: 1,
                    },
                    // @ts-ignore
                    data: overallData?.data
                  }}/>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12} className="column">
            <Card title="Cases Country-Wise">
              <Table columns={columns} dataSource={tableSource} scroll={{y: 300}}/>
            </Card>
          </Col>
        </Row>
      </Layout.Content>
      <Layout.Footer style={{textAlign: 'center'}}>
        © 2020 Created by <a href="mailto:sambhavjain2612@gmail.com">Sambhav Jain</a>
        <br/>
        API Used: <a href="https://api.covid19api.com/summary" target="_blank" rel="noreferrer">
        https://api.covid19api.com/summary
      </a>
      </Layout.Footer>
    </Layout>
  );
}

export default App;
