const app = Vue.createApp({ 
    data(){
        return {  
            myNameIs: null,
            searchFilter: null,
            results: null,      /** array: search results (crops) */
            notice: null,       /** string: for any warnings/errors */
            plot: {
                farmer: null,
                crops: []
            }          /** array: crops owned by farmer */
        }
    },
    methods:{     
        /**  process the hello form to get the user's name  
         *  Ask NodeJS / MongoDB to find the farmer's plot
         * i.e. which crops the farmer already owns */
        hello(){  
            axios.get('/plot', {params: {farmer: this.myNameIs}} )
                .then(response =>  this.plot = response.data )
                .catch(error =>  this.showNotice("Error." ))
        },
        /**  process the search form by sending the query to NodeJS */
        search(){ 
            this.notice = null; // reset notices/messages 
            axios.get('/search', {params: {filter: this.searchFilter}} )
                .then(response => {
                    if (Array.isArray(response.data)) return this.results = response.data
                    this.showNotice(response.data)
                 })
                .catch(error =>  this.showNotice("No Results.") );
        },
        /** Skip a result (e.g. in case of 403 errors on images ) */
        skip(crop){
            this.results =  this.results.filter(x => x.id !== crop.id);  
        },  
        
      
        /** Check if a given search result is owned
         * (i.e. it already exists in the farmer's plot). */
        isOwned(crop){
            if ( this.plot.crops.filter(x => x.id == crop.id).length > 0 ) return true;
            return false;
        },
        /** add a given crop to the farmer's plot.  */
        add(crop){
            if ( this.isOwned(crop)) return
            this.plot.crops.push(crop);
            this.save()
        },
        /** remove a given crop from the farmer's plot.  */
        remove(crop){
            this.plot.crops = this.plot.crops.filter(x => x.id !== crop.id); 
            this.save()
        },
        save(){
            axios.post(  '/plot',  this.plot )
                .then(() => this.showNotice("Data Saved.") )
                .catch(() =>  this.showNotice("Unable to Save Data.") );
        },
        showNotice(text){
            this.notice = text;
            setTimeout(() => this.notice = false, 2000);
        },
        /** Hide the search to reveal the farmer's plot (current list of owned crops) */
        clearSearch(){
            this.searchFilter = null;
            this.results = null;
            this.notice = null;
        }
    }

}).mount('#app')