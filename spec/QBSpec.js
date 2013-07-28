describe("QuickBlox SDK", function() {
  var quickBlox;
  var configBlank = {};

  beforeEach(function (){
    quickBlox = new QuickBlox();
  });

  it("can be instantiate", function(){
    expect(quickBlox).not.toBe(null);
  });

  describe("Default settings", function(){

    it("should know api endpoints and paths", function(){
      expect(quickBlox.urls).toEqual(DEFAULTS.urls);
    });
  
    it("should have the default config", function(){
      expect(quickBlox.config).toEqual(DEFAULTS.config);
    });

  });

});
