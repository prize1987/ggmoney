//http://13.209.68.72:32590/getStoreInfo?indutype=%EC%9D%8C%EC%8B%9D%EC%A0%90&conditions=%EC%88%98%EC%9B%90+%ED%8C%94%EB%8B%AC&from=5&limit=209

class AWSApi {
  constructor() {}

  getStoreInfo = async (sigun, indutype, conditions, from, limit) => {
    const url = 'http://13.209.68.72:32590/getStoreInfo';

    let fetch_url = url + '?sigun=' + sigun;
    fetch_url += '&indutype=' + indutype;
    fetch_url += '&conditions=' + conditions.replace(' ', '+');
    fetch_url += '&from=' + from;
    fetch_url += '&limit=' + limit;
    // fetch_url += '&SIGUN_NM=' + sigun;

    const response = await fetch(fetch_url);
    const json = await response.json();

    return json;
  };

  getStoreInfoCount = async (sigun, indutype, conditions) => {
    const url = 'http://13.209.68.72:32590/getStoreInfoCount';

    let fetch_url = url + '?sigun=' + sigun;
    fetch_url += '&indutype=' + indutype;
    fetch_url += '&conditions=' + conditions.replace(' ', '+');
    // fetch_url += '&SIGUN_NM=' + sigun;
    console.log(fetch_url);
    const response = await fetch(fetch_url);
    const json = await response.json();

    return +json[0].CNT;
  };

  getStoreInfoByArea = async (
    sigun,
    indutype,
    conditions,
    lat_lcl,
    lat_ucl,
    lon_lcl,
    lon_ucl,
    limit,
  ) => {
    const url = 'http://13.209.68.72:32590/getStoreInfoByArea';

    let fetch_url = url + '?sigun=' + sigun;
    fetch_url += '&indutype=' + indutype;
    fetch_url += '&conditions=' + conditions.replace(' ', '+');
    fetch_url += '&lat_lcl=' + lat_lcl;
    fetch_url += '&lat_ucl=' + lat_ucl;
    fetch_url += '&lon_lcl=' + lon_lcl;
    fetch_url += '&lon_ucl=' + lon_ucl;
    fetch_url += '&limit=' + limit;

    console.log(fetch_url);
    const response = await fetch(fetch_url);
    const json = await response.json();

    return json;
  };
}

export default AWSApi;
