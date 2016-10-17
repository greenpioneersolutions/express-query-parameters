module.exports = {
  query: {
    // strict: false, // Not supported yet
    sort: '',
    filter: {},
    limit: 20,
    skip: 0,
    select: ''
  },
  settings: {
    // autoParse: true, // Add support to not having to always use auto-parse
    // delete: [], // Add support to delete returned keys in later versions
    schema: [],
    adapter: 'mongoose'
  }
}
