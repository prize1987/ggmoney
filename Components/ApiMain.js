class ApiMain {
  constructor() {}

  getApiData(sigun, index, size) {
    const url = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
    const appKey = 'cc5f595a2a564bd99625d91ed8abe7e0';
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
    const appKey = 'cc5f595a2a564bd99625d91ed8abe7e0';
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
    const appKey = 'cc5f595a2a564bd99625d91ed8abe7e0';
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
}

export default ApiMain;
