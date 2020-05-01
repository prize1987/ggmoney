import SQLite from 'react-native-sqlite-storage';

class GGDB {
  state = {
    db: null,
  };
  constructor() {
    this.openDB();
  }

  openDB = () => {
    this.state.db = SQLite.openDatabase(
      {
        name: 'ggmoney',
        createFromLocation: '~www/ggmoney.db',
        location: 'Library',
      },
      this.successToOpenDB,
      this.failToOpenDB,
    );
  };

  successToOpenDB = () => {
    // alert('test');
  };
  failToOpenDB = err => {
    console.log(err);
  };

  selectGgmoney = (conditions, from, limit) => {
    const {db} = this.state;

    const conditionList = conditions.split(' ');
    let selectQuery = 'SELECT * FROM GGMONEY WHERE 1=1';

    for (let i = 1; i <= conditionList.length; i++) {
      selectQuery +=
        ' AND (CMPNM_NM LIKE ?' +
        i +
        ' OR REFINE_LOTNO_ADDR LIKE ?' +
        i +
        ' OR REFINE_ROADNM_ADDR LIKE ?' +
        i +
        ' OR INDUTYPE_NM LIKE ?' +
        i +
        ')';
      conditionList[i - 1] = '%' + conditionList[i - 1] + '%';
    }

    console.log(selectQuery);
    console.log(conditionList);

    return new Promise((resolve, reject) => {
      // if (db !== null) {
      db.transaction(tx => {
        tx.executeSql(
          selectQuery + ' LIMIT ' + from + ',' + limit,
          conditionList,
          (tx, results) => {
            let ret = [];
            let dataLength = results.rows.length;
            // console.log(ret.length);
            for (let i = 0; i < dataLength; i++) {
              ret.push(results.rows.item(i));
            }

            resolve(ret);
          },
          err => {
            reject(err);
          },
        );
      });
      // }
    });
  };

  selectGgmoneyCnt = conditions => {
    let {db} = this.state;

    const conditionList = conditions.split(' ');
    let selectQuery = 'SELECT COUNT(*) CNT FROM GGMONEY WHERE 1=1';

    for (let i = 1; i <= conditionList.length; i++) {
      selectQuery +=
        ' AND (CMPNM_NM LIKE ?' +
        i +
        ' OR REFINE_LOTNO_ADDR LIKE ?' +
        i +
        ' OR REFINE_ROADNM_ADDR LIKE ?' +
        i +
        ' OR INDUTYPE_NM LIKE ?' +
        i +
        ')';
      conditionList[i - 1] = '%' + conditionList[i - 1] + '%';
    }

    return new Promise((resolve, rejct) => {
      // if (db !== null) {
      db.transaction(tx => {
        tx.executeSql(selectQuery, conditionList, (tx, results) => {
          // console.log(results.rows.item(0).CNT);
          resolve(results.rows.item(0).CNT);
        });
      });
      // }
    });
  };

  deleteGgmoney = sigun => {
    let {db} = this.state;

    return new Promise((resolve, reject) => {
      // if (db !== null) {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM GGMONEY WHERE SIGUN_NM = ?',
          [sigun],
          (tx, results) => {
            if (results !== null) {
              //   console.log('delete Success : ' + results.rowsAffected);
              resolve(results.rowsAffected);
            } else {
              console.log('delete ggmoney failed');
              reject(-1);
            }
          },
          err => {
            console.log(err);
          },
        );
      });
      // }
    });
  };
  insertGgmoney = data => {
    let {db} = this.state;
    let insertCnt = 0;

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        for (let i = 0; i < data.length; i++) {
          tx.executeSql(
            'INSERT INTO GGMONEY (' +
              'CMPNM_NM,' +
              'INDUTYPE_NM,' +
              'TELNO,' +
              'REFINE_LOTNO_ADDR,' +
              'REFINE_ROADNM_ADDR,' +
              'REFINE_ZIP_CD,' +
              'REFINE_WGS84_LOGT,' +
              'REFINE_WGS84_LAT,' +
              'SIGUN_NM) ' +
              'VALUES (?,?,?,?,?,?,?,?,?)',
            [
              data[i].CMPNM_NM,
              data[i].INDUTYPE_NM,
              data[i].TELNO,
              data[i].REFINE_LOTNO_ADDR,
              data[i].REFINE_ROADNM_ADDR,
              data[i].REFINE_ZIP_CD,
              data[i].REFINE_WGS84_LOGT,
              data[i].REFINE_WGS84_LAT,
              data[i].SIGUN_NM,
            ],
            (tx, results) => {
              if (results.rowsAffected > 0) {
                // console.log('Success : ' + results.rowsAffected);
                insertCnt += results.rowsAffected;
                resolve(insertCnt);
              } else {
                console.log('insert ggmoney failed');
                reject(-1);
              }
            },
            err => {
              console.log(err);
            },
          );
        }
        // resolve(insertCnt);
      });
    });
  };
  replaceGgmoney = () => {
    let {db} = this.state;

    let sqlList = [
      'ALTER TABLE GGMONEY RENAME TO GGMONEY_BAK',
      'ALTER TABLE GGMONEY_TMP RENAME TO GGMONEY',
      'ALTER TABLE GGMONEY_BAK RENAME TO GGMONEY_TMP',
      'DELETE FROM GGMONEY_TMP',
    ];

    return new Promise((resolve, reject) => {
      // if (db !== null) {
      db.transaction(tx => {
        for (let i = 0; i < sqlList.length; i++) {
          tx.executeSql(
            sqlList[i],
            [],
            (tx, results) => {
              if (results !== null) {
                //   console.log('delete Success : ' + results.rowsAffected);
                resolve(results.rowsAffected);
              } else {
                console.log('SQL Failed : ' + sqlList[i]);
                reject(-1);
              }
            },
            err => {
              console.log(err);
            },
          );
        }
      });
      // }
    });
  };

  selectMstSigun = () => {
    let {db} = this.state;

    let selectQuery =
      'SELECT * FROM MST_SIGUN ORDER BY USE_FLAG DESC, SIGUN_NM';

    return new Promise((resolve, reject) => {
      // if (db !== null) {
      db.transaction(tx => {
        tx.executeSql(
          selectQuery,
          [],
          (tx, results) => {
            let ret = [];
            let dataLength = results.rows.length;
            // console.log(ret.length);
            for (let i = 0; i < dataLength; i++) {
              ret.push(results.rows.item(i));
            }

            resolve(ret);
          },
          err => {
            reject(err);
          },
        );
      });
      // }
    });
  };
  updateMstSigun = (sigun, itemCnt, useFlag) => {
    let {db} = this.state;
    let updateCnt = 0;

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE MST_SIGUN SET ITEM_CNT = ?, USE_FLAG = ? WHERE SIGUN_NM = ?',
          [itemCnt, useFlag, sigun],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              updateCnt += results.rowsAffected;
              resolve(updateCnt);
            } else {
              console.log('update mst_sigun failed');
              reject(-1);
            }
          },
          err => {
            console.log(err);
          },
        );
      });
    });
  };

  temporaryInsert = () => {
    let {db} = this.state;

    let sqlList = [
      'CREATE TABLE MST_SIGUN (SIGUN_NM	TEXT,ITEM_CNT	INTEGER,USE_FLAG	INTEGER)',
      "INSERT INTO MST_SIGUN VALUES ('가평군' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('고양시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('과천시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('광명시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('광주시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('구리시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('군포시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('김포시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('남양주시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('동두천시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('부천시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('성남시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('수원시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('시흥시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('안산시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('안성시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('안양시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('양주시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('양평군' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('여주시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('연천군' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('오산시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('용인시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('의왕시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('의정부시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('이천시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('파주시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('평택시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('포천시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('하남시' , 0, 0)",
      "INSERT INTO MST_SIGUN VALUES ('화성시', 0, 0)",
    ];

    return new Promise((resolve, reject) => {
      // if (db !== null) {
      db.transaction(tx => {
        for (let i = 0; i < sqlList.length; i++) {
          tx.executeSql(
            sqlList[i],
            [],
            (tx, results) => {
              if (results !== null) {
                console.log('delete Success : ' + results.rowsAffected);
                resolve(results.rowsAffected);
              } else {
                console.log('SQL Failed : ' + sqlList[i]);
                reject(-1);
              }
            },
            err => {
              console.log(err);
            },
          );
        }
      });
      // }
    });
  };
}

export default GGDB;
