//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../../node_modules/cashRegister/cashRegister",
		jquery: "../../node_modules/jquery/dist/jquery.min",
		subscribers: "../../node_modules/subscribers/subscribers"
	}
});

require(["cashRegister", "jquery"], function (cashRegister, $) {
//var cashRegister = require('cashRegister');
	var account;
	$(document).ready(function(){
		//make a decision
		var localStorageJson = localStorage.getItem("Account");
		if (localStorageJson && localStorageJson!== "undefined" && localStorageJson!== "null"){
			$("#welcomePage").css("display","none");	//temporary
			console.log(typeof localStorageJson);
			console.log(localStorageJson);
			var obj = JSON.parse(localStorageJson);
			account = cashRegister.Account.loadJSON(obj);
			presentAccount();
			account.subscribe("change", function(){
			presentAccount();
			});
		}
		if (!account){
			var welcome=$("#welcomePage");
			welcome.css("display","block");

			//send to welcome page
			//initialize account by calling cashRegister.Account.initializeAccount(balance, acctname) and call presentAccount
		}
		$("#submitWelcome").click(function(){
				account=cashRegister.Account.initializeAccount(($("#SBalance").val()*1), $("#acctName").val());
				$("#welcomePage").css("display","none");
				presentAccount();
				account.subscribe("change", function(){
				presentAccount();
				});
			});

		$("#submitDeposit").click(function(){
			try{
			account.addTransaction(($("#transactionAmount").val()*1)
						,$("#transactionDate").val()
						,$("#accountType").val()
						,$("#memo").val());
			}catch(err){
				alert(err);
			}

		});
		$("#submitWithdraw").click(function(){
			try{
			account.addTransaction(($("#transactionAmount").val()*-1)
						,$("#transactionDate").val()
						,$("#accountType").val()
						,$("#memo").val());
			}catch(err){
				alert(err);
			}
		});
		$("#deleteAccount").click(function(){
			account=null;
			$("#accountMainPage").css("display","none");
			$("#welcomePage").css("display","block");


		});



	});
	function presentAccount(){
		$("#accountMainPage").css("display","block");
		var table=$("#mainTable");
		table.empty();
		table.append($("<tr><th class='date'>Date</th><th class='type'>Type</th><th class='memo'>Memo</th><th class='amount'>Amount</th><th class='balance'>Balance</th></tr>"));
		table.append($("<tr><td class='date'></td><td class='type'></td><td class='memo'></td><td class='amount'></td><td class='balanceCol'>"+account.startingBalance+"</td></tr>"));
		var row, i;
		for (i=0;i<account.transactions.length;i++){
			row = makeRow(account.transactions[i]);
			table.append(row);

		}
		function makeRow(transactionObj){

			var tr = $("<tr></tr>");
			if (transactionObj.amount<0){
				tr.addClass("withdrawRow");
			}
			else{
				tr.addClass("depositRow");
			}
			tr.append($("<td class='date'>"+transactionObj.date+"</td>"));
			tr.append($("<td class='type'>"+transactionObj.type+"</td>"));
			tr.append($("<td class='memo'>"+transactionObj.memo+"</td>"));
			tr.append($("<td class='amount'>"+transactionObj.amount+"</td>"));
			var balanceCalc = $("#mainTable tr:last-child .balanceCol").html()*1+transactionObj.amount;
			//console.log($("#mainTable>tbody:last-child .balanceCol").html());
			tr.append($("<td class='balanceCol'>"+balanceCalc+"</td>"));
			return tr;
		}
		$("#currentBalance").html("Balance: "+account.currentBalance);

	}

	$(window).unload(function(){
		localStorage.setItem("Account", JSON.stringify(account));
	});
});
