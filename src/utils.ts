import axios from 'axios';
import * as _ from 'lodash';
import {notification} from "antd";

interface Data {
  cases: number;
  recovered: number;
  deaths: number;
  active: number;
  data: Object[];
}

export const getDashboardData = async () => {
  try {
    const response = (await axios.get('https://api.covid19api.com/summary'))?.data;
    const overall: Data = {
      cases: 0,
      recovered: 0,
      deaths: 0,
      active: 0,
      data: []
    };
    overall.cases = response?.Global?.TotalConfirmed;
    overall.recovered = response?.Global?.TotalRecovered;
    overall.deaths = response?.Global?.TotalDeaths;
    overall.active = overall?.cases - (overall?.recovered + overall?.deaths);
    Object.keys(overall).map(key => {
      if (key !== 'cases' && key !== 'data') {
        overall.data.push({
          label: _.startCase(_.toLower(key)),
          // @ts-ignore
          value: Number(overall[key])
        });
      }
    });

    const dataSource = response?.Countries?.length > 0 && Array.from(response.Countries).map((ele: any) => {
      return {
        _id: ele?.slug,
        name: ele?.Country,
        confirmed: ele?.TotalConfirmed,
        recovered: ele?.TotalRecovered,
        deaths: ele?.TotalDeaths,
      }
    });

    return {overall, dataSource};
  } catch (e) {
    console.log(e);
    notification.error({message: 'Error!', description: e.message});
  }
};
