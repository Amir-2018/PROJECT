
     
        a  = 2
        const fn = () =>{
            if(a==2){
                const container  = document.querySelector('.container');
                container.classList.toggle('containerP')
                document.querySelector('.btn').style.display="none"
                document.querySelector('.fa-bars').style.visibility="visible"
                document.querySelector('.fa-bars').style.possition="relative"
                // document.querySelector('.test1').style.width="47px"
                console.log(a)

                a++
            }else
            if(a%2==0){
                const container  = document.querySelector('.container');
                container.classList.toggle('containerP')
                document.querySelector('.btn').style.display="none"
                document.querySelector('.fa-bars').style.visibility="visible"
                // document.querySelector('.test1').style.width="47px"
                console.log(a)
               
                a++
            }else{
                const container  = document.querySelector('.container');
                container.classList.toggle('containerP')
                document.querySelector('.btn').style.display="block"
                document.querySelector('.fa-bars').style.visibility="hidden"
                // document.querySelector('.test1').style.width="161.15px"
                console.log(a)
                
                a++
            }

            
            // container.style.gridTemplateColumns = "60px auto"
        }
        var xValues = [50,60,70,80,90,100,110,120,130,140,150];
        var yValues = [7,8,8,9,9,9,10,11,14,14,15];
        
        new Chart("myChart", {
          type: "line",
          data: {
            labels: xValues,
            datasets: [{
              fill: false,
              lineTension: 0,
              backgroundColor: "rgba(0,0,255,1.0)",
              borderColor: "rgba(0,0,255,0.1)",
              data: yValues
            }]
          },
          options: {
            legend: {display: false},
            scales: {
              yAxes: [{ticks: {min: 6, max:16}}],
            }
          }
        });

        const deleteB = ()=>{
          document.querySelector('.box-del').classList.remove('block-display')
          document.querySelector('.box-del').classList.add('none-display')
          document.querySelector('.container').classList.remove('blur')
          document.querySelector('.box-del').classList.remove('box-delNone')
        }

      const blockAff = ()=>{
       
        
        document.querySelector('.box-del').classList.remove('none-display')
        document.querySelector('.box-del').classList.add('block-display')
        document.querySelector('.container').classList.add('blur')
        document.querySelector('.box-del').classList.add('box-delNone')

        
        //filter: blur(5px);
      }

      function GetSelected() {
        //Create an Array.
        var selected = new Array();
 
        //Reference the Table.
        var tblFruits = document.getElementById("tblFruits");
 
        //Reference all the CheckBoxes in Table.
        var chks = tblFruits.getElementsByTagName("INPUT");
 
        // Loop and push the checked CheckBox value in Array.
        for (var i = 0; i < chks.length; i++) {
            if (chks[i].checked) {
                selected.push(chks[i].value);
            }
        }
 
        //Display the selected CheckBox values.
        if (selected.length > 0) {
          
          let xhr = new XMLHttpRequest();
          
          xhr.open("POST", "/delete_multiple");
          
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");
          
          xhr.onload = () => console.log(xhr.responseText);
          
          let data = JSON.stringify(selected);
          const test = confirm('Are you sure you want to delete this store?');
          if(test){
            location.href="/get_store_page"
            xhr.send(data);
            
          }
            
        }else{
          alert('Please select at least one store')
        }
    };


    function GetSelectedP() {
      //Create an Array.
      var selected = new Array();

      //Reference the Table.
      var tblFruits = document.getElementById("tblFruits");

      //Reference all the CheckBoxes in Table.
      var chks = tblFruits.getElementsByTagName("INPUT");

      // Loop and push the checked CheckBox value in Array.
      for (var i = 0; i < chks.length; i++) {
          if (chks[i].checked) {
              selected.push(chks[i].value);
          }
      }

      //Display the selected CheckBox values.
      if (selected.length > 0) {
        
        let xhr = new XMLHttpRequest();
        
        xhr.open("POST", "/delete_multiple_products");
        
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        
       
        
        let data = JSON.stringify(selected);
        const test = confirm('Are you sure you want to delete this store?');
        if(test)
          xhr.send(data);
        
          xhr.onload = () =>{
              var link = (xhr.responseText).slice(1,(xhr.responseText.length)-1)
              location.href="/get_products_Page/"+link
            
        } 
        
          
      }else{
        alert('Please select at least one product')
      }
  };


  function GetSelectedG() {
    //Create an Array.
    var selected = new Array();

    //Reference the Table.
    var tblFruits = document.getElementById("tblFruits");

    //Reference all the CheckBoxes in Table.
    var chks = tblFruits.getElementsByTagName("INPUT");

    // Loop and push the checked CheckBox value in Array.
    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            selected.push(chks[i].value);
        }
    }

    //Display the selected CheckBox values.
    if (selected.length > 0) {
      
      let xhr = new XMLHttpRequest();
      
      xhr.open("POST", "/delete_multiple_caisses");
      
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
      
     
      
      let data = JSON.stringify(selected);
      const test = confirm('Are you sure you want to delete this store?');
      if(test)
        xhr.send(data);
      
        xhr.onload = () =>{
            var link = (xhr.responseText).slice(1,(xhr.responseText.length)-1)
            location.href="/get_caisses_Page/"+link
          
      } 
      
        
    }else{
      alert('Please select at least one product')
    }
};



function GetSelectedM() {
  //Create an Array.
  var selected = new Array();

  //Reference the Table.
  var tblFruits = document.getElementById("tblFruits");

  //Reference all the CheckBoxes in Table.
  var chks = tblFruits.getElementsByTagName("INPUT");

  // Loop and push the checked CheckBox value in Array.
  for (var i = 0; i < chks.length; i++) {
      if (chks[i].checked) {
          selected.push(chks[i].value);
      }
  }

  //Display the selected CheckBox values.
  if (selected.length > 0) {
    
    let xhr = new XMLHttpRequest();
    
    xhr.open("POST", "/delete_multiple_caissiers");
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    
   
    
    let data = JSON.stringify(selected);
    const test = confirm('Are you sure you want to delete this store?');
    if(test)
      xhr.send(data);
    
      xhr.onload = () =>{
          var link = (xhr.responseText).slice(1,(xhr.responseText.length)-1)
          location.href="/get_caissier/"+link
        
    } 
    
      
  }else{
    alert('Please select at least one caissier')
  }
};

function GetSelectedO() {
  //Create an Array.
  var selected = new Array();

  //Reference the Table.
  var tblFruits = document.getElementById("tblFruits");

  //Reference all the CheckBoxes in Table.
  var chks = tblFruits.getElementsByTagName("INPUT");

  // Loop and push the checked CheckBox value in Array.
  for (var i = 0; i < chks.length; i++) {
      if (chks[i].checked) {
          selected.push(chks[i].value);
      }
  }

  //Display the selected CheckBox values.
  if (selected.length > 0) {
    
    let xhr = new XMLHttpRequest();
    
    xhr.open("POST", "/delete_multiple_admins");
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    
   
    
    let data = JSON.stringify(selected);
    const test = confirm('Are you sure you want to delete theses admins?');
    if(test)
      xhr.send(data);
    
      xhr.onload = () =>{
          location.href="/manage_admins_For_Delete"
        
    } 
    
      
  }else{
    alert('Please select at least one admin')
  }
};