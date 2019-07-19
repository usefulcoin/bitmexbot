#!/bin/bash

read -p "What percentage of your precious portfolio do you wish to throw away in decimal terms? (for example 0.05 for 5%) [0.01]: " riskratio
riskratio=${riskratio:-0.01}

read -p "Which portfolio exactly are we talking about here? (for example 'underlying exchange') [bitcoin]: " account
account=${account:-bitcoin}

read -p "Are you bullish or bearish? (you can say either 'long' or 'short') [long]: " financialposition
financialposition=${financialposition:-long}

read -p "On which financial instrument exactly? ('XBTU19', 'XBTZ19', 'XBTH19', or 'XBTM19') [XBTUSD]: " financialinstrument
financialinstrument=${financialinstrument:-XBTUSD}

read -p "What return were you dreaming of for holding that position in decimal terms? (for example 0.05 for 5%) [0.05]: " equityreturn
equityreturn=${equityreturn:-0.05}

read -p "On what mobile number may I message you if your dreams come true? [+15104594120]: " contactnumber
contactnumber=${contactnumber:-+15104594120}

while (true) ; do node bitmexbot.js $riskratio $account $financialposition $financialinstrument $equityreturn $contactnumber ; sleep 5 ; done
