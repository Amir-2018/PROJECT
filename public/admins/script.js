
     
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