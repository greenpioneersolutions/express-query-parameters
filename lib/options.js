module.exports = {
  query: {
    strict: false,
    sort: '',
    filter: {},
    limit: 20,
    lean: false,
    skip: 0,
    select: ''
  },
  mongoose: {
    populateId: '',
    populateItems: '',
    limitToPopulateId: '',
    limitToPopulateItems: '',
    deepPopulate: '',
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
  sql: {
    // Future Plan
  },
  settings: {
    aggregate: false,
    errorMessage: '< Error',
    warningMessage: '< Warning',
    delete: [],
    mongoose: false,
    sql: false,
    schema: []
  }
}
