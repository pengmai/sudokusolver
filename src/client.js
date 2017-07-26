function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  throwError(response);
}

function parseJSON(response) {
  return response.json();
}

function throwError(response) {
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  //console.log(error); // eslint-disable-line no-console
  throw error;
}

function solve(board) {
  // ES6 function to flatten a multi-dimensional array. Credit:
  // https://gist.github.com/Nishchit14/4c6a7349b3c778f7f97b912629a9f228
  let flatten =
    arr => [].concat.apply([], arr.map(
      element => Array.isArray(element) ? flatten(element) : element));
  var param = flatten(board).join("");

  var headers = new Headers({
    "accept": "application/json"
  });
  var init = {method: 'POST', headers: headers, mode: 'cors'};
  var req = new Request('/api/v1/sudokuapi.php?request=solve/' + param, init);
  return fetch(req)
    .then(checkStatus)
    .then(parseJSON)
    .catch(err => ({error: err.response}));
    //.then((response) => (response.solution))
    //.catch((err) => (err.error));
}

const Client = { solve };
export default Client;
