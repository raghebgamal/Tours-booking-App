class ApiFeaturs{
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        
    }
    filtering() {
        const queryobj = { ...this.queryString};
        const exclude = ["page", "item","sort","fields","limit"];
        exclude.forEach(el => delete queryobj[el]);
        let querystr = JSON.stringify(queryobj);
        querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        const queryimplment = JSON.parse(querystr)
        this.query = this.query.find(queryimplment);
        return this;
        
    }
    sorting() {
        if (this.queryString.sort) {
            const querysort = this.queryString.sort.split(",").join(" ")
            this.query.sort(querysort);
        } else {
            this.query.sort("createdatAt");
        }
        return this;
    }
    fields() {
          if (this.queryString.fields) {
            const queryFields = this.queryString.fields.split(",").join(" ");
           this. query.select(queryFields);
        } else {
           this. query.select("-__v");
        }


        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
       
        return this;
        }
}
module.exports = ApiFeaturs;