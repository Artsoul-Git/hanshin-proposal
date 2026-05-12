// =============================================
// Code.gs — メインルーター
// =============================================

function doGet(e) {
  const action = e.parameter.action || '';
  const token  = e.parameter.token  || '';

  try {
    switch (action) {
      case 'login':         return Auth.login(token);
      case 'getDailyLogs':  return Records.getLogs(token, parseInt(e.parameter.days) || 30);
      case 'getReports':    return Reports.getReports(token);
      case 'openReport':    return Reports.markOpened(token);
      case 'getContent':    return ContentManager.getContent(token);
      case 'getBiorhythm':  return Records.getBiorhythm(token);
      case 'getUsers':        return Admin.getUsers(token);
      case 'getContentAdmin': return ContentManager.getAllContent(token);
      case 'getTestimonials': return Testimonials.getAll(token);
      default:
        return jsonErr('unknown action: ' + action);
    }
  } catch (err) {
    console.error(err);
    return jsonErr(err.message);
  }
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch(_) {}

  const action = e.parameter.action || body.action || '';
  const token  = body.token || '';

  try {
    switch (action) {
      case 'login':           return Auth.login(token);
      case 'setupProfile':    return Auth.setupProfile(token, body);
      case 'saveDailyLog':    return Records.saveLog(token, body);
      case 'createUser':        return Admin.createUser(token, body);
      case 'generateReports':   return Reports.generateAll(token);
      case 'approveTestimonial':return Testimonials.approve(token, body);
      case 'submitTestimonial': return Testimonials.submit(token, body);
      case 'addContent':        return ContentManager.addContent(token, body);
      case 'updateContent':     return ContentManager.updateContent(token, body);
      case 'deleteContent':     return ContentManager.deleteContent(token, body);
      default:
        return jsonErr('unknown action: ' + action);
    }
  } catch (err) {
    console.error(err);
    return jsonErr(err.message);
  }
}

// OPTIONSリクエスト（CORSプリフライト）対応
function doOptions() {
  return setCorsHeaders(ContentService.createTextOutput(''));
}
