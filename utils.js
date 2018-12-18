var exports = module.exports = {};

exports.nameParser = (data) => {
    
    let data2 = data.replace(/\D/g, '');
    let data3 = data2.replace(/^0+/g, '');
    if (data3.length === 1) {
        return '00' + data3;
    } else if (data3.length === 2) {
        return '0' + data3;
    } else {
        return data3;
    }
}

exports.conType = (data) => {
    if (data !== null) {
        let octet = data.split('.');
        if (octet[0] == '166') {
            return 'LTE';
        } else {
            return 'WAN';
        }
    }
}

exports.accountParser = (data) => {
    let accNum = data.split('/');
    return accNum[6];
}


