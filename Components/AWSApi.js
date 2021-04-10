class AWSApi {
  constructor() {
    this.initConnectionInfo();
  }

  initConnectionInfo = async () => {
    try {
      const url =
        'https://prize1987.github.io/ggmoney_backend/config/config.json';
      const response = await fetch(url);
      const text = await response.text();
      const config = JSON.parse(text);

      this.url = `${config.protocol}://${config.awsip}:${config.awsport}`;
    } catch (e) {
      this.url = 'http://13.209.68.72:32590';
    }
  };

  getStoreInfo = async (sigun, indutype, conditions, from, limit) => {
    const url = `${this.url}/getStoreInfo`;

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
    const url = `${this.url}/getStoreInfoCount`;

    let fetch_url = url + '?sigun=' + sigun;
    fetch_url += '&indutype=' + indutype;
    fetch_url += '&conditions=' + conditions.replace(' ', '+');
    // fetch_url += '&SIGUN_NM=' + sigun;

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
    const url = `${this.url}/getStoreInfoByArea`;

    let fetch_url = url + '?sigun=' + sigun;
    fetch_url += '&indutype=' + indutype;
    fetch_url += '&conditions=' + conditions.replace(' ', '+');
    fetch_url += '&lat_lcl=' + lat_lcl;
    fetch_url += '&lat_ucl=' + lat_ucl;
    fetch_url += '&lon_lcl=' + lon_lcl;
    fetch_url += '&lon_ucl=' + lon_ucl;
    fetch_url += '&limit=' + limit;

    const response = await fetch(fetch_url);
    const json = await response.json();

    return json;
  };
}

export default AWSApi;
