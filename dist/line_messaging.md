[line messaging api]
name: 設計新鮮人
Channel ID: 2007235677
Channel secret: 8902861a4a43d783905a06b6b1c51dde

[line login]
name: 設計新鮮人
Channel ID: 2007863926
Channel secret: 9cd42596920bd6cb9314870fa2c42d55

[Google Apps Script]
部署作業 ID:
AKfycbwGHvNxBzCFI2EEBCbGTdpOixZDbcVOP_Ms15A_3Ep9lNG6ULgqecmn9Up02zTd4k4l

網頁應用程式:
https://script.google.com/macros/s/AKfycbwGHvNxBzCFI2EEBCbGTdpOixZDbcVOP_Ms15A_3Ep9lNG6ULgqecmn9Up02zTd4k4l/exec

==============================================================

var sheetName = 'contact' // sheet 名稱
var sheetObj = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) // 取得 sheet 物件

function doGet(e) {
var params = e.parameter
params.\_from = 'doGet'
return ContentService.createTextOutput(JSON.stringify(params)).setMimeType(ContentService.MimeType.JSON)
}

function doPost(e) {
var params = e.parameter
var name = params.name
var email = params.email
var subject = params.subject
var message = params.message
var created_at = new Date()
sheetObj.appendRow([name, email, subject, message, created_at]) // 插入一列新的資料

    params._from = 'doPost'
    return ContentService.createTextOutput(JSON.stringify(params)).setMimeType(ContentService.MimeType.JSON)

}
