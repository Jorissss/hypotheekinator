// Mortgage simulation logic ported from Python to JS
// Exposed as window.simulate(params)
window.simulate = function(params){
  const loan = Number(params.loan);
  const annual_rate = Number(params.annual_rate);
  const investment_return = Number(params.investment_return);
  const inflation = Number(params.inflation);
  const tax_rate = Number(params.tax_rate);
  const years = Number(params.years);
  const woz_value = Number(params.woz_value);
  const ewf_rate = Number(params.ewf_rate);

  const months = years*12;
  const r = annual_rate/12;
  const r_inv = investment_return/12;
  const r_inf = inflation/12;

  const annuity_payment = loan * (r / (1 - Math.pow(1 + r, -months)));
  const principal_payment = loan / months;

  let balance_ann = loan;
  let balance_lin = loan;
  let ann_investment = 0;
  let lin_investment = 0;
  const ann_net = [];
  const lin_net = [];

  const initial_interest = loan * r;
  const ewf_monthly_initial = woz_value * ewf_rate / 12;
  const initial_net_deduction = Math.max(initial_interest - ewf_monthly_initial, 0);
  const budget = (principal_payment + initial_interest) - initial_net_deduction * tax_rate;

  let inflation_factor = 1;

  for(let m=0;m<months;m++){
    inflation_factor *= 1 + r_inf;
    const ewf_monthly = woz_value * ewf_rate / 12;

    // annuity
    const interest_ann = balance_ann * r;
    const net_deduction_ann = Math.max(interest_ann - ewf_monthly, 0);
    const tax_refund_ann = net_deduction_ann * tax_rate;
    const principal_ann = annuity_payment - interest_ann;
    balance_ann -= principal_ann;
    const effective_payment_ann = annuity_payment - tax_refund_ann;

    // linear
    const interest_lin = balance_lin * r;
    const net_deduction_lin = Math.max(interest_lin - ewf_monthly, 0);
    const tax_refund_lin = net_deduction_lin * tax_rate;
    const payment_lin = principal_payment + interest_lin;
    balance_lin -= principal_payment;
    const effective_payment_lin = payment_lin - tax_refund_lin;

    // invest savings vs shared budget
    ann_investment = ann_investment * (1 + r_inv) + (budget - effective_payment_ann);
    lin_investment = lin_investment * (1 + r_inv) + (budget - effective_payment_lin);

    const ann_real = (-balance_ann + ann_investment) / inflation_factor;
    const lin_real = (-balance_lin + lin_investment) / inflation_factor;

    ann_net.push(ann_real);
    lin_net.push(lin_real);
  }

  const years_arr = Array.from({length:months}, (_,i)=> (i+1)/12);
  return {
    years: years_arr,
    ann_net,
    lin_net,
    final_ann: ann_net[ann_net.length-1],
    final_lin: lin_net[lin_net.length-1]
  };
};