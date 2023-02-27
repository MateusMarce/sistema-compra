import { Field } from "formik"


function PaymentCard({nome, pagador, keyK, setPaymentCheck, paymentCheck, setFieldValue, values, setMenuValue, options}:any) {

  const handleCheckPay = () => {
    const params = location.pathname.split('/')[2]
    setPaymentCheck(keyK)

    if (keyK == 0) {
      setFieldValue('local', 3)
      if(pagador){
        setFieldValue('unidade', values)
        setMenuValue({value: values, label:options.filter((i:any)=>i.value == pagador.unidade)[0].label})
      } else {
        setFieldValue('unidade', 0)
        setMenuValue({value: undefined, label:undefined})
      }
    } else {
      setFieldValue('local', parseFloat(params))
      setFieldValue('unidade', 2000003)
      setMenuValue({value:2000003, label:options.filter((i:any)=>i.value == 2000003)[0].label})
    }
  }

  return (
    <div className="div-btn-input" title={nome} key={keyK} style={{position:'relative', width:'25%'}}>
      <label htmlFor={nome} className='btn-input-label'>
        {nome === 'Dinheiro' && <i className="bi bi-cash-stack d-flex justify-content-center fs-1"></i>}
        {nome === 'PIX' && <i className="bi bi-qr-code d-flex justify-content-center fs-1"></i>}
        {nome === 'Conta' && <i className="bi bi-wallet2 d-flex justify-content-center fs-1"></i>}
        {nome === 'Cartão' && <i className="bi bi-credit-card d-flex justify-content-center fs-1"></i>}
        <p className="d-flex justify-content-center mt-2 mb-0 fw-bold">{nome}</p>
      </label>
      <Field
        type="radio"
        name='radio'
        className='btn-input'
        id={nome}
        disabled={((nome == 'Conta' || nome == 'SATC') && pagador?.tipo === 'E') || (nome == 'SATC' && pagador?.tipo === 'A')}
        onChange={handleCheckPay}
        value={keyK}
        checked={paymentCheck === keyK}
      />
    </div>
  )
}

export default PaymentCard