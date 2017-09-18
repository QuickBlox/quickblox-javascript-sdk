class Data {
  constructor(className, service) {
    this.attrs = {};

    this._className = className;

    this._service = service;
  }

  get(attr) {
    return this.attrs[attr];
  }

  set(attr, value) {
    this.attrs[attr] = value;

    return this;
  }

  /**
   * Return all properties in JSON (Object) notation.
   * 
   * @returns Object-copy of properties
   * @memberof Data
   */
  toJSON() {
    return Object.assign({}, this.attrs);
  }

  save() {
    const className = this._className;
    const data = this.toJSON();

    return new Promise((resolve, reject) => {
      this._service({
        method: 'POST',
        url: `${className}.json`,
        data: data
      }).then(function(responce) {
        resolve(responce.data);
      }).catch((error) => {
        reject(error);
      })
    });
  }

  
}

export default Data;
