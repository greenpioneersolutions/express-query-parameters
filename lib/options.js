module.exports = {
  query: {
    // strict: false, // Not supported yet
    sort: '',
    filter: {},
    limit: 20,
    skip: 0,
    select: '',
    deepPopulate: '',
    populateId: '',
    populateItems: '',
    limitToPopulateId: '',
    limitToPopulateItems: '',
    where: '',
    gt: false,
    gte: false,
    lte: false,
    lt: false,
    in: false,
    ne: false,
    nin: false,
    regex: false,
    options: false,
    size: false,
    all: false,
    equals: false,
    find: false,
    or: false,
    nor: false,
    and: false
  },
  settings: {
    // autoParse: true, // Add support to not having to always use auto-parse
    // delete: [], // Add support to delete returned keys in later versions
    schema: [],
    adapter: 'mongoose'
  }
}
