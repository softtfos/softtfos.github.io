$(document).ready(function(){
    $('#myTable').DataTable();
    $('#datepickerFrom').datepicker({
        format: 'dd.mm.yyyy',
        autoclose: true
    });
    $('#datepickerTo').datepicker({
        format: 'dd.mm.yyyy',
        autoclose: true
    });
    $('#datepickerPair').datepair();
    if (localStorage.length) {
        $('#datepickerFrom').val(localStorage.getItem('dateFrom'));
        $('#datepickerTo').val(localStorage.getItem('dateTo'));
        $('#apiKey').val(localStorage.getItem('apiKey'));
        $('#phoneNumber').val(localStorage.getItem('phoneNumber'));
    }
});

var tableTemplate = '<table id="myTable" class="table" cellspacing="0" width="100%"><thead><tr>'
    + '<th>Number</th>'
    + '<th>Status</th>'
    + '<th>StatusCode</th>'
    + '<th>DatePayedKeeping</th>'
    + '<th>OrderId</th>'
    + '<th>Cost</th>'
    + '</tr></thead><tbody></tbody></table>';
function sendAjax(dateFrom, dateTo, apiKey) {
    $.ajax({
        url: 'https://api.novaposhta.ua/v2.0/json/',
        dataType : "json",
        type: "post",
        data: JSON.stringify({
            "apiKey": apiKey,
            "modelName": "InternetDocument",
            "calledMethod": "getDocumentList",
            "methodProperties": {
                "DateTimeFrom": dateFrom,
                "DateTimeTo": dateTo,
                "GetFullList": "1",
                "UnassembledCargo": "1"
            }

        }),
        success: function (data, textStatus) {
            console.log('getDocumentsList array ' + data.data.length);
            var ttnInfo = prepareTtn(data.data);
            sendTtnAjax(ttnInfo)
        }
    });
}
var flags = [];

function sendTtnAjax(documents) {
    var resultDocumentsArr = [];
    var i;
    for (i = 0; i < documents.length; i++) {
        flags.push(true);
        $.ajax({
            url: 'https://api.novaposhta.ua/v2.0/json/',
            dataType : "json",
            type: "post",
            data: JSON.stringify({
                modelName: 'TrackingDocument',
                calledMethod: 'getStatusDocuments',
                methodProperties: {
                    Documents: documents[i]
                }

            }),
            success: function (data, textStatus) {
                resultDocumentsArr.push(data.data);
                flags.splice(0, 1);
                if (!flags.length) {
                    var resultDocuments = [];
                    for (var i = 0; i < resultDocumentsArr.length; i++) {
                        resultDocuments = resultDocuments.concat(resultDocumentsArr[i])
                    }
                    var used = {};
                    var filtered = resultDocuments.filter(function(obj) {
                        return obj.Number in used ? 0 : (used[obj.Number] = 1);

                    });
                    console.log('Filtered array ' + filtered.length)
                    drawTable(filtered);
                }
            }
        });
    }
}

function prepareTtn(data) {
    var phoneNumber = $('#phoneNumber').val();
    var i,
        l = 0,
        barrier = 100;
    var ttnInfoArr = [];
    ttnInfoArr.push([]);
    for (i = 0; i < data.length; i++) {
        if (i >= barrier) {
            l++;
            barrier += 100;
            ttnInfoArr.push([]);
        }
        ttnInfoArr[l].push({
            DocumentNumber: data[i].IntDocNumber,
            Phone: phoneNumber
        })
    }
    return ttnInfoArr;
}
function drawTable(data) {
    $('#tableWrapper').empty();
    $('#tableWrapper').append(tableTemplate);
    var i;
    var string = '';
    for (i = 0; i < data.length; i++) {
        string += '<tr><td>'
            + data[i].Number
            + '</td><td>'
            + data[i].Status
            + '</td><td>'
            + data[i].StatusCode
            + '</td><td>'
            + data[i].DatePayedKeeping
            + '</td><td>'
            + data[i].ClientBarcode
            + '</td><td>'
            + data[i].AnnouncedPrice
            + '</td></tr>'
    }
    $('tbody').append(string);
    $('#myTable').DataTable();
}

$('#checkBtn').click(function() {
    var dateFrom = $('#datepickerFrom').val();
    var dateTo = $('#datepickerTo').val();
    var apiKey = $('#apiKey').val();
    var phoneNumber = $('#phoneNumber').val();
    if (!localStorage.length) {
        localStorage.setItem('dateFrom', dateFrom);
        localStorage.setItem('dateTo', dateTo);
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('phoneNumber', phoneNumber);
    } else {
        if (localStorage.getItem('dateFrom') !== dateFrom) {
            localStorage.setItem('dateFrom', dateFrom);
        }
        if (localStorage.getItem('dateTo') !== dateTo) {
            localStorage.setItem('dateTo', dateTo);
        }
        if (localStorage.getItem('apiKey') !== apiKey) {
            localStorage.setItem('apiKey', apiKey);
        }
        if (localStorage.getItem('phoneNumber') !== phoneNumber) {
            localStorage.setItem('phoneNumber', phoneNumber);
        }
    }
    sendAjax(dateFrom, dateTo, apiKey)
});

$('#clearBtn').click(function () {
    $('#datepickerFrom').val('');
    $('#datepickerTo').val('');
    $('#apiKey').val('');
    $('#phoneNumber').val('');
    localStorage.clear();
});
