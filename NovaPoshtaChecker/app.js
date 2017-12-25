$(document).ready(function(){
    $('#myTable').DataTable();
});

var tableTemplate = '<table id="myTable" class="table" cellspacing="0" width="100%"><thead><tr>'
    + '<th>Number</th>'
    + '<th>Status</th>'
    + '<th>StatusCode</th>'
    + '<th>Weight(kg)</th>'
    + '<th>Cost</th>'
    + '</tr></thead><tbody></tbody></table>';
function sendAjax(documents) {
    $.ajax({
        url: 'https://api.novaposhta.ua/v2.0/json/',
        dataType : "json",
        type: "post",
        data: JSON.stringify({
            modelName: 'TrackingDocument',
            calledMethod: 'getStatusDocuments',
            methodProperties: {
                Documents: documents
            }

        }),
        success: function (data, textStatus) {
            $('#tableWrapper').empty();
            $('#tableWrapper').append(tableTemplate);
            var i;
            var string = '';

            for (i = 0; i < data.data.length; i++) {
                var rowClass = '';
                var statusCode = parseInt(data.data[i].StatusCode);
                if (statusCode === 7 || statusCode === 8) {
                    rowClass = 'wait'
                } else if (statusCode >= 9 && statusCode <= 11) {
                    rowClass = 'done'
                } else if (statusCode === 6) {
                    rowClass = 'soon'
                }
                if (rowClass) {
                    string += '<tr class="'+ rowClass +'"><td>'
                        + data.data[i].Number
                        + '</td><td>'
                        + data.data[i].Status
                        + '</td><td>'
                        + data.data[i].StatusCode
                        + '</td><td>'
                        + data.data[i].DocumentWeight
                        + '</td><td>'
                        + data.data[i].DocumentCost
                        + '</td></tr>'
                } else {
                    string += '<tr><td>'
                        + data.data[i].Number
                        + '</td><td>'
                        + data.data[i].Status
                        + '</td><td>'
                        + data.data[i].StatusCode
                        + '</td><td>'
                        + data.data[i].DocumentWeight
                        + '</td><td>'
                        + data.data[i].DocumentCost
                        + '</td></tr>'
                }
            }
            $('tbody').append(string);
            $('#myTable').DataTable();
        }
    });
}

$('#checkBtn').click(function() {
    var text = $('textarea#info').val();
    var ttnInfoStringArr = text.split(', ');
    var i;
    var ttnInfoArr = [];
    for (i = 0; i < ttnInfoStringArr.length; i++) {
        var singleTtn = ttnInfoStringArr[i].split(' ');
        ttnInfoArr.push({
            DocumentNumber: singleTtn[0],
            Phone: singleTtn[1]
        })
    }
    sendAjax(ttnInfoArr);
});

$('#testBtn').click(function() {
    var ttnInfoArr = [];
    var i;
    var testTtn = parseInt($('textarea#info').val());
    for (i = 0; i < 50; i++) {
        ttnInfoArr.push({
            DocumentNumber: testTtn++ + ''
        })
    }
    sendAjax(ttnInfoArr);
});
