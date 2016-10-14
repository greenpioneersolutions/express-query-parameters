function SqlAdapter (query) {
  return {
    sql: function (cb) {
      cb(null, null)
    }
  }
}

SqlAdapter.options = {
  // Future Plan
  and: true
}

module.exports = SqlAdapter
