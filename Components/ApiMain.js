import {API_KEY_GGMONEY} from 'react-native-dotenv';

class ApiMain {
  constructor() {}

  getApiData(sigun, index, size) {
    const url = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
    const appKey = API_KEY_GGMONEY;
    const pIndex = index;
    const pSize = size;
    const type = 'json';

    let fetch_url = url + '?KEY=' + appKey;
    fetch_url += '&pIndex=' + pIndex;
    fetch_url += '&pSize=' + pSize;
    fetch_url += '&type=' + type;
    fetch_url += '&SIGUN_NM=' + sigun;

    return new Promise((resolve, reject) => {
      fetch(fetch_url)
        .then(result => result.json())
        .then(result => {
          let fetchedRows = result.RegionMnyFacltStus[1].row;
          resolve(fetchedRows);
          //   console.log('apicnt get : ' + this.apiTotalCount);
        })
        .catch(e => console.log(e));
    });
  }

  getApiTotalCount() {
    const url = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
    const appKey = API_KEY_GGMONEY;
    const pIndex = 1;
    const pSize = 1;
    const type = 'json';

    let fetch_url = url + '?KEY=' + appKey;
    fetch_url += '&pIndex=' + pIndex;
    fetch_url += '&pSize=' + pSize;
    fetch_url += '&type=' + type;

    return new Promise((resolve, reject) => {
      fetch(fetch_url)
        .then(result => result.json())
        .then(result => {
          resolve(result.RegionMnyFacltStus[0].head[0].list_total_count);
          //   console.log('apicnt get : ' + this.apiTotalCount);
        })
        .catch(e => console.log(e));
    });
  }

  getApiSigunCount(sigun) {
    const url = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
    const appKey = API_KEY_GGMONEY;
    const pIndex = 1;
    const pSize = 1;
    const type = 'json';

    let fetch_url = url + '?KEY=' + appKey;
    fetch_url += '&pIndex=' + pIndex;
    fetch_url += '&pSize=' + pSize;
    fetch_url += '&type=' + type;
    fetch_url += '&SIGUN_NM=' + sigun;

    return new Promise((resolve, reject) => {
      fetch(fetch_url)
        .then(result => result.json())
        .then(result => {
          resolve(result.RegionMnyFacltStus[0].head[0].list_total_count);
          //   console.log('apicnt get : ' + this.apiTotalCount);
        })
        .catch(e => console.log(e));
    });
  }

  searchApiDataCount(searchConName, searchConAddr, addrType) {
    const url = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
    const appKey = API_KEY_GGMONEY;
    const pIndex = 1;
    const pSize = 1;
    const type = 'json';

    let fetch_url = url + '?KEY=' + appKey;
    fetch_url += '&pIndex=' + pIndex;
    fetch_url += '&pSize=' + pSize;
    fetch_url += '&type=' + type;

    if (searchConName.length > 0) {
      fetch_url += '&CMPNM_NM=' + searchConName;
    }
    if (searchConAddr.length > 0) {
      if (addrType === 'road') {
        fetch_url += '&REFINE_ROADNM_ADDR=' + searchConAddr;
      } else {
        fetch_url += '&REFINE_LOTNO_ADDR=' + searchConAddr;
      }
    }

    console.log(fetch_url);

    return new Promise((resolve, reject) => {
      fetch(fetch_url)
        .then(result => result.json())
        .then(result => {
          if (result.RegionMnyFacltStus === undefined) {
            resolve(0);
          } else {
            resolve(result.RegionMnyFacltStus[0].head[0].list_total_count);
            //   console.log('apicnt get : ' + this.apiTotalCount);
          }
        })
        .catch(e => console.log(e));
    });
  }
  searchApiData(index, size, searchConName, searchConAddr, addrType) {
    const url = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
    const appKey = API_KEY_GGMONEY;
    const pIndex = index;
    const pSize = size;
    const type = 'json';

    let fetch_url = url + '?KEY=' + appKey;
    fetch_url += '&pIndex=' + pIndex;
    fetch_url += '&pSize=' + pSize;
    fetch_url += '&type=' + type;

    if (searchConName.length > 0) {
      fetch_url += '&CMPNM_NM=' + searchConName;
    }
    if (searchConAddr.length > 0) {
      if (addrType === 'road') {
        fetch_url += '&REFINE_ROADNM_ADDR=' + searchConAddr;
      } else {
        fetch_url += '&REFINE_LOTNO_ADDR=' + searchConAddr;
      }
    }
    console.log('data search');
    return new Promise((resolve, reject) => {
      fetch(fetch_url)
        .then(result => result.json())
        .then(result => {
          if (result.RegionMnyFacltStus === undefined) {
            resolve(null);
          } else {
            let fetchedRows = result.RegionMnyFacltStus[1].row;
            resolve(fetchedRows);
          }
        })
        .catch(e => console.log(e));
    });
  }
}

export default ApiMain;
