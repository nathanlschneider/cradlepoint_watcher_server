var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'doughnut',
    data: {
        datasets: [{
            data: [90,10],
            backgroundColor: ['#feb236',' #d64161'],
            borderColor: ['#f0efef','#f0efef'],
            hoverBackgroundColor:['#ffc347',' #e75272']
        }],
        labels:['WAN', 'LTE']
    }
});