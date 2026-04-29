// Supabase Edge Function: send-confirmation-email
// Sends a branded HTML confirmation email via Resend when an artist registers for a mural square.
// The Resend API key is stored securely as a Supabase secret (RESEND_API_KEY).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SQUARE_IMAGE_URLS: Record<string, string> = {
  "A1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/HYnOYmPSIiMHlMaR.png",
  "A2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/IaXpLXGWwLKUhZEu.png",
  "A3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/xoBfKdYogjRgdyiy.png",
  "A4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/spZHesRljkjHzhug.png",
  "A5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LoMuQNWErEQPFORZ.png",
  "A6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/PGWHsVbhKwqHvXDN.png",
  "A7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LynVPMZwoKinfzwL.png",
  "A8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/yNQCHfXUeCYfNBGx.png",
  "A9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/mAlocVlzNnBPByWM.png",
  "A10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/MQQoDErntXEmuSqv.png",
  "A11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/SCLTsgekFxkuwaCv.png",
  "A12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/wflIjTMaVLHfYMNW.png",
  "A13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/yKkTbGZDiuIKhrUx.png",
  "B1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/nXVcZOszmRAwVgid.png",
  "B2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BzlXosIoVMgJYKMF.png",
  "B3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/RRCagqvNKeOXPkLM.png",
  "B4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LPxyjfVxdrMKtGEU.png",
  "B5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/dcLxLjITMcMIPjBJ.png",
  "B6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/yzfHBwlWHkFkXJvK.png",
  "B7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/EJjOSDdeDVLNPvWD.png",
  "B8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FxdxfegdmZqXPAsm.png",
  "B9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/DDIpNupgYYNVnFaa.png",
  "B10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/SoHMHLEOiTlNoYwP.png",
  "B11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/yUMgwJCZqaWGvRwZ.png",
  "B12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/AjYVpbdADeHNdwxZ.png",
  "B13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/zxnUDnPziJVzwsfP.png",
  "C1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/bRnhiGGhVpsCipNA.png",
  "C2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/koRPNLaSmQsoXUca.png",
  "C3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QXfHGbtEZfxtUDWr.png",
  "C4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/MHPAWqldWYRSQqUZ.png",
  "C5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/uwWhspCiSiApahIz.png",
  "C6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/XoWnYNHNVMvhqNpv.png",
  "C7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/qeCkBLxLfaPTeTXQ.png",
  "C8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/KUzQQgyWtLXYwvLT.png",
  "C9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LRXySJuCsInWClMu.png",
  "C10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/qgLHJOhUeXwGCfpr.png",
  "C11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ndULEeLoGNldqooG.png",
  "C12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jbFZYkZZifnZDkOM.png",
  "C13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/odZQiJXlkwOOVLlJ.png",
  "D1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/XRbuveLJKdHEbBYE.png",
  "D2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZQzItWlFcthOwigz.png",
  "D3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/EOiISKfxCHpEHNLm.png",
  "D4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jaazhMORMuVnZTTZ.png",
  "D5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/OMPXMCAGoDBCRsZP.png",
  "D6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/kScOkqRfBQKpWfcI.png",
  "D7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/cnTUQhltFJcEPKyX.png",
  "D8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/VnZwBWBwGnfhxWBZ.png",
  "D9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/misHjtrTXjEwbbOA.png",
  "D10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/yMWMEtYVTiufssKy.png",
  "D11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/fbTpqiMajmOXSqEZ.png",
  "D12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/VYVddKuZPmLKqzKO.png",
  "D13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/DDTVuBGqzYGMQIWU.png",
  "E1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FZxpRSvCuPrMOPGZ.png",
  "E2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jSSKlVyNGowuVjaS.png",
  "E3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZSgGbxYxqJRBywMp.png",
  "E4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/eNGIlrozWQfrdRrJ.png",
  "E5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/cSshIyGSBeGBfUSU.png",
  "E6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/HmcXKCaWEhkGNaRN.png",
  "E7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/RRYSwsAVhdjcGByk.png",
  "E8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/UHyXCHbSqvxOJavq.png",
  "E9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/DzKgEHUMHBcHkGEq.png",
  "E10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BeyfLQtlUejJKFTk.png",
  "E11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/cgbnhAEBzyzVxRoa.png",
  "E12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/wEYbVfPjxRxdXPwF.png",
  "E13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/fuudoZZNGCHtclZK.png",
  "F1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/XmnsVQKrbnfdDujK.png",
  "F2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/NTMwCvrxrpGtTkLd.png",
  "F3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/upGheZYGuEFwTsWF.png",
  "F4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/AmjPCRVFWPrygxtl.png",
  "F5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ftcoswWCdcLPiBYQ.png",
  "F6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/JfUYsOsvqInjveNU.png",
  "F7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZQxuYxqlKsnyMRgE.png",
  "F8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ojwDZUhITxFLUVxj.png",
  "F9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/enoowsqSxCPKCdEh.png",
  "F10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/WZItSljPArxoDymj.png",
  "F11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/KlqRTSWgxTWuxGeg.png",
  "F12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FjywVYocOqPYXBOq.png",
  "F13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/lMkqivbhMkWzvkFN.png",
  "G1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/XpqfLiybHPYoiDeM.png",
  "G2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/JWoifCVuPybJpESV.png",
  "G3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/cLvtBJEBtylyICDK.png",
  "G4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/dAhxlCZknqYRQiTj.png",
  "G5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LAxbTrEfVNFVudZC.png",
  "G6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LVVnfdPJPuTARQnL.png",
  "G7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/bKIyfsCXLLuRTivn.png",
  "G8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/mubknYILzfbcYZMw.png",
  "G9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QGpefCtUEMBrygDw.png",
  "G10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/muDqyfSUxtEuJxCk.png",
  "G11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/HDoPpAdSzkbmBRbj.png",
  "G12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FwnMADkhBnBqrKcU.png",
  "G13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BEmruiocceYwXPVz.png",
  "H1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/GVfUyGesoKBTDQwz.png",
  "H2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LWZVPFAGAgkOoqvm.png",
  "H3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/UYqNgiRyAGlKIbMZ.png",
  "H4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/uBmnxZbniToyixkp.png",
  "H5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/GeqBbpcumXcjeviA.png",
  "H6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/EYFyIDCwhKAmThvX.png",
  "H7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/JCpAAfprllkIrdVv.png",
  "H8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/VNYMQtEBBGiHFhEG.png",
  "H9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/THSfkZlstNtLieNL.png",
  "H10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/zlhrnMSzSYWmFtCW.png",
  "H11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/brDTothyMAiLiSTk.png",
  "H12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/iSlglAhwgDKmNdmf.png",
  "H13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LwMxKpyxzKcmGhwZ.png",
  "I1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/zaoinCkroYOLster.png",
  "I2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ftujMqQPZVooilsc.png",
  "I3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/nyoxDbntaSbiRwDa.png",
  "I4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/dnHGAtHFBVrZyuOj.png",
  "I5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/zBnaCRmLDVtZCEfD.png",
  "I6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/qjucvOnlORDyvqnW.png",
  "I7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/SPVxETBVPfkwNsBV.png",
  "I8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/NcgfFHuHGFlmVPtl.png",
  "I9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/NOxLVxSrLSgNpzbH.png",
  "I10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BrDhjrZsvclsjNnJ.png",
  "I11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BfQxrlUNBhjCfdYc.png",
  "I12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/RamajKEFiRSAMuIW.png",
  "I13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jVaWPqeKyOCZJOQR.png",
  "J1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/YBGNbKNBjkONHxXE.png",
  "J2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/JFPCLMXruqemifXY.png",
  "J3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/wAVBHodXbCJyapWr.png",
  "J4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/hznJABcFONVOrxmN.png",
  "J5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BeorPNijHDroysrz.png",
  "J6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ooZQVCTEhmBPmqKT.png",
  "J7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/PuJomCqofmDnHwXt.png",
  "J8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jKGYCihPyNjNANDZ.png",
  "J9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/eMxeZvDnqACyKNIC.png",
  "J10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FGSyDMtfJCtwuggj.png",
  "J11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZrFhwzcGQXLAnsrB.png",
  "J12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QnmhxKmQwxYQeeqZ.png",
  "J13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/IxhUgOIvmPTzzhif.png",
  "K1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/PoGXOfSaBIFFOhmy.png",
  "K2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/dyoGhuDwFhnIomUo.png",
  "K3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/xcoDiPrnPuhEJlQj.png",
  "K4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/OuiNhPZGnupQvNfR.png",
  "K5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ivhMbCYhtSLqjNTd.png",
  "K6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/MXNgqRxldIZgbGpb.png",
  "K7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/eZNXEPLKeNnVkOKN.png",
  "K8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QHMxZlxGZWevZKvl.png",
  "K9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ObyMotPhwYlAeZrh.png",
  "K10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/lNgoIonvlENwYdwW.png",
  "K11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/KhznqzuQFwghgVMJ.png",
  "K12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/HjOlFDMGTJKYIEdw.png",
  "K13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/NWCEjufQhXAazVet.png",
  "L1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/tHtqNvRYvxhmdsuR.png",
  "L2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/JiwxKrLQeFjVxqxH.png",
  "L3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/gimmxMjHluHgaUiE.png",
  "L4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/wKRhzAEvsjQRYHeB.png",
  "L5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/SWVKrAAuwHvEOhXw.png",
  "L6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/hCxfhOECMSlCqytQ.png",
  "L7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/vDbmtWoXryawtIMd.png",
  "L8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/WVmqrlhXNsEFglCJ.png",
  "L9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ntsyygynlClYvSIJ.png",
  "L10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/xYDefThwPyMayTTB.png",
  "L11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/GmTUSWSiPFyIKKvn.png",
  "L12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/oiVmjvkblBAnjMDe.png",
  "L13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/vWLSfjdAcTKqWTAI.png",
  "M1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/tbNemqpIJHzrLRwB.png",
  "M2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/tiCMecJPPUURcyIU.png",
  "M3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/UtKFnqMDGvYihGhQ.png",
  "M4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/rBoPEnJvwtOCfGLa.png",
  "M5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/hsTEInEVUiHLNyEd.png",
  "M6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZXpERuMjMrmdinTa.png",
  "M7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/eEfoEFHvERKHBnjH.png",
  "M8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jNtligslXaowHXqz.png",
  "M9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ETXKfqaKkRjZGqnC.png",
  "M10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/fcCjRnMqsSqmehlV.png",
  "M11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/tbgoxJAYNhKXrnqh.png",
  "M12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/dnidsAXpWGtGqYqS.png",
  "M13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/oanErcooUEKjdUQm.png",
  "N1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/RYhywdRQxdtXlNzx.png",
  "N2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/IQpXUZKAcXEUQhns.png",
  "N3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/rcLykhrmPqDleaJU.png",
  "N4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FBcnEWLGUXWEgale.png",
  "N5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/UaIGrJGnEArkwosl.png",
  "N6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/xXRSYgiQnvsuFxVb.png",
  "N7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/gYeLFfmIkXUjilbj.png",
  "N8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/mMkElIKVrjmmmdZA.png",
  "N9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/uJroRdTMBgcktFMt.png",
  "N10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/tBJdknDwPKaZJper.png",
  "N11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/oekJMohsXMwBwsYs.png",
  "N12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ewNrcIjKBXrQmRCk.png",
  "N13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/oLOpCEXdofXywgIu.png",
  "O1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/YimfYlMHHZbHraEx.png",
  "O2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/WKfbCzzIpzUCZZKb.png",
  "O3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/kjuLaVyjxtwExHUA.png",
  "O4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/AoRgzOQxllaFTKlo.png",
  "O5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BXkbxAyYsbNjMdjm.png",
  "O6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/eEMrzaMnPjjTjFuW.png",
  "O7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/lDaCGUfNIaXCEqZR.png",
  "O8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/mobsAjQBmDlstgWB.png",
  "O9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/UlweUYDEvJeSUJOp.png",
  "O10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/kFGyHHiqqwVuBqbE.png",
  "O11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/GqXyGtOiEXraeTrb.png",
  "O12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/xaaqtgDdMmGyXhlv.png",
  "O13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/vesUTlBBGEdOsDIG.png",
  "P1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ONHCLiwVtyaOulRs.png",
  "P2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/KCGNknSuBhGRRZcF.png",
  "P3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QkfEWVOvngdguZYY.png",
  "P4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/DWPemCONEJrjuGEV.png",
  "P5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/EPRIQRxyStHdXCTa.png",
  "P6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZqHkFtBbZMlxYRnm.png",
  "P7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/foiSRVAlFlQyKjoa.png",
  "P8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/dGQpWTNWfBkegjma.png",
  "P9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/VziLOgDzIcfUGWmm.png",
  "P10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/PFigxGGHScpbatzc.png",
  "P11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZMYclAPMcnOzFnaS.png",
  "P12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/RKqNXgOaVdmrQrBL.png",
  "P13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/DUQkQYXmliLneMWs.png",
  "Q1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/OnZhCYDIPWnCCCNG.png",
  "Q2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/OFuRnhQozdHGluRa.png",
  "Q3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/RQaHXzjJmBfYzKki.png",
  "Q4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/lmJadWoTsBPotbNO.png",
  "Q5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/chKsSGXpkNKGeBEM.png",
  "Q6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/mpQhfUOPejarOeVR.png",
  "Q7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QtyVdbmaGkAjzcTK.png",
  "Q8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/cDdTYZTwkjfZPUrX.png",
  "Q9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/XChuaRVBwndvQejO.png",
  "Q10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/KwjXbegTygDozbIo.png",
  "Q11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/WwYroxHgRwSaFzBX.png",
  "Q12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/LkzptsCyFEDsuUij.png",
  "Q13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/rjABGhjtwYueAnzc.png",
  "R1": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/XURxUxehfrsPZtqg.png",
  "R2": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/aicNXidkcUgdsEbv.png",
  "R3": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/FPJDKELEAlAsjDYU.png",
  "R4": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/zrIPFeRuyCGIIhSv.png",
  "R5": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/rwKTRLmCJgjmgUUZ.png",
  "R6": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/MpLpJmuDGmKOmwVw.png",
  "R7": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/BppNnomVBCgnAuQn.png",
  "R8": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/jXJDBrZVuQILgHhi.png",
  "R9": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/QbOlnILcfiLiJpQW.png",
  "R10": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/hgJsytuBufFSETqN.png",
  "R11": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/NVfsDvNRYOTMdsZY.png",
  "R12": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/SCYVVLEhLutxJSbO.png",
  "R13": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663484711992/ZJONwROrCGwYpzkd.png",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildEmailHtml(name: string, cell: string, imageUrl: string): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f1b2d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #f5c542; margin: 0; font-size: 24px;">Art of Aviation</h1>
    <p style="color: #a0c4e8; margin: 5px 0 0;">Community Mural</p>
  </div>
  <div style="padding: 30px; background: #ffffff;">
    <p style="font-size: 16px; color: #333;">Hi ${name},</p>
    <p style="color: #555;">Thank you for registering for the <strong>Art of Aviation Community Mural</strong>!</p>
    <p style="color: #555;">You have been assigned <strong style="color: #1e3a5f; font-size: 18px;">Square ${cell}</strong>.</p>
    <div style="text-align: center; margin: 25px 0;">
      <p style="color: #777; font-size: 13px; margin-bottom: 10px;">YOUR SQUARE ARTWORK</p>
      <img src="${imageUrl}" alt="Square ${cell}" style="width: 200px; height: 200px; border-radius: 8px; border: 3px solid #1e3a5f;" />
      <p style="color: #888; font-size: 12px; margin-top: 8px;">Match these colors as closely as possible</p>
    </div>
    <div style="background: #f0f4f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1e3a5f; margin: 0 0 12px;">Next Steps</h3>
      <p style="color: #555; margin: 6px 0;">1. Pick up your canvas at <strong>The Discovery</strong> between <strong>May 1 and June 1</strong></p>
      <p style="color: #555; margin: 6px 0;">2. Paint your square — any material welcome, match colors as closely as possible</p>
      <p style="color: #dc2626; margin: 10px 0; padding: 10px; background: #fff5f5; border: 1px solid #dc2626; border-radius: 6px; font-weight: bold;">3. IMPORTANT: On the BACK of your canvas, write your square number (${cell}), your first and last name, and mark “TOP” at the top edge.</p>
      <p style="color: #555; margin: 6px 0;">4. Return your completed square to The Discovery by <strong>Sunday, June 15th</strong></p>
      <p style="color: #555; margin: 6px 0;">5. Join us for a community reception and <strong>Artown Kickoff</strong> the evening of <strong>July 2nd</strong> at The Discovery, where we will unveil the final mural!</p>
    </div>
    <p style="color: #555;">If you have any questions, please do not hesitate to reach out.</p>
    <p style="color: #555;">Thank you for being part of something extraordinary!</p>
  </div>
  <div style="background: #1e3a5f; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
    <p style="color: #a0c4e8; margin: 0; font-size: 13px;">Art of Aviation Community Mural Team</p>
    <p style="color: #6b8db5; margin: 5px 0 0; font-size: 11px;">Presented by Artown, The Discovery, The George W. Gillemot Foundation and Strengthen our Community</p>
  </div>
</div>`.trim();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, cell } = await req.json();

    // Validate inputs
    if (!email || !name || !cell) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, name, cell" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const imageUrl = SQUARE_IMAGE_URLS[cell];
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: `No image found for cell ${cell}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get the Resend API key from Supabase secrets
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const html = buildEmailHtml(name, cell, imageUrl);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Art of Aviation Mural <noreply@artowncommunitymural.com>",
        to: [email],
        subject: `Art of Aviation Mural - You are registered for Square ${cell}!`,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
