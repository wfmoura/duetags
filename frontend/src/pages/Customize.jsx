import React, { useContext, useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Divider
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { AppContext } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useProduct } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import supabase from "../utils/supabaseClient";
import { generateThemeImages } from "../services/aiService";
import { getDominantColor, suggestColorsForTheme, hexToCmyk, hexToRgb } from "../utils/colorUtils";

// Import step components
import KitSelectionStep from "../components/customize/KitSelectionStep";
import ThemeSelectionStep from "../components/customize/ThemeSelectionStep";
import CustomizationStep from "../components/customize/CustomizationStep";
import ReviewStep from "../components/customize/ReviewStep";
import OnboardingTour from '../components/customize/OnboardingTour';
import Etiquetas from "../components/Etiquetas";
import DeliveryStep from "../components/customize/DeliveryStep";

function Customize() {
  const location = useLocation();
  const navigate = useNavigate();

  // Contexts
  const {
    selectedKit, setSelectedKit,
    selectedTheme, setSelectedTheme,
    customizations, setCustomizations,
    showMessage
  } = useContext(AppContext);
  const { user } = useAuth();
  const { kits, temas, categorias, etiquetas, fontesDisponiveis, isLoading: isProductsLoading } = useProduct();
  const { clearCart } = useCart();

  // Local State
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [labelPositions, setLabelPositions] = useState({});
  const [showDesignModal, setShowDesignModal] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  // AI Modal State
  const [openAiModal, setOpenAiModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
  const [aiIndividualPrompts, setAiIndividualPrompts] = useState({});
  const [individualGenerating, setIndividualGenerating] = useState({});
  const [baseAiSeed, setBaseAiSeed] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [tempSelectedAiImage, setTempSelectedAiImage] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const steps = ["Escolher Estilo", "Personalizar", "Finalizar Pedido"];

  const handleLabelPositionChange = (key, fieldId, pos) => {
    setLabelPositions(prev => ({
      ...prev,
      [key]: { ...prev[key], [fieldId]: pos }
    }));
  };

  const normalizeKit = (kit) => {
    if (!kit) return null;
    // Ensure etiquetas property exists for mapping
    return {
      ...kit,
      etiquetas: kit.etiquetas || kit.kit_etiquetas?.map(ke => ({ id: ke.etiqueta_id, quantidade: ke.quantidade })) || []
    };
  };

  // Effect para lidar com carregamento de pedido via URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('edit');
    const isAdminMode = user?.role === 'admin' && !!orderId;

    if (orderId && kits.length > 0 && temas.length > 0 && !isLoadingOrder && !editingOrderId) {
      loadOrderForEditing(orderId);
    }
  }, [location.search, kits, temas, user]);

  // Effect para carregar o kit inicial do estado da navegação ou localStorage
  useEffect(() => {
    const rawPending = localStorage.getItem("pendingCustomization");
    const localStorageData = rawPending ? JSON.parse(rawPending) : null;

    // Combinamos o estado da navegação com o localStorage
    // Priorizamos o localStorage para dados de customização se ele existir
    const stateData = { ...(location.state || {}), ...(localStorageData || {}) };

    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('edit');

    if (!orderId && stateData.selectedKit) {
      const normalized = normalizeKit(stateData.selectedKit);
      setSelectedKit(normalized);

      // Se tivermos um activeStep salvo, restauramos ele
      const stepToRestore = stateData.activeStep !== undefined ? stateData.activeStep : 0;
      setActiveStep(stepToRestore);

      if (stateData.selectedTheme) setSelectedTheme(stateData.selectedTheme);
      if (stateData.customizations) setCustomizations(stateData.customizations);

      // Se voltamos do login e estávamos no passo 2, tentamos finalizar automaticamente
      // Verificamos se temos o 'user' para que o handleFinalizar funcione corretamente
      if (localStorageData && stepToRestore === 2 && user) {
        setTimeout(() => {
          handleFinalizar();
        }, 500);
        // Só removemos se já restauramos e tentamos finalizar (ou se não precisava finalizar)
        localStorage.removeItem("pendingCustomization");
      } else if (!localStorageData || stepToRestore !== 2) {
        // Se não é um caso de auto-finalizar, removemos logo
        localStorage.removeItem("pendingCustomization");
      }
    } else if (rawPending && user) {
      // Se por algum motivo temos pendente mas não restauramos (ex: kit sumiu), limpamos também
      localStorage.removeItem("pendingCustomization");
    }
  }, [user, location.state]); // Adicionamos location.state para reagir a mudanças vindas do navigate

  const loadOrderForEditing = async (orderId) => {
    setIsLoadingOrder(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Find Kit and Theme objects from the context-provided lists
      const kit = kits.find(k => String(k.id) === String(order.kit_id));
      const theme = temas.find(t => String(t.id) === String(order.tema_id));

      if (kit) setSelectedKit(normalizeKit(kit));

      if (theme) {
        setSelectedTheme(theme);
      } else if (order.tema_id && order.tema_id.startsWith('ai-')) {
        // Recover AI theme from order metadata
        setSelectedTheme({
          id: order.tema_id,
          nome: order.tema_nome || 'Tema AI',
          thumbnail: order.original_asset_url,
          isAiBackground: true
        });
      }

      if (order.customizations) {
        setCustomizations(order.customizations);
        if (order.customizations.labelPositions) {
          setLabelPositions(order.customizations.labelPositions);
        }
      }

      setEditingOrderId(orderId);
      setActiveStep(1); // Jump straight to customization
      showMessage("Pedido carregado para edição.", "info");
    } catch (err) {
      console.error("Error loading order for edit:", err);
      showMessage("Não foi possível carregar o pedido para edição.", "error");
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // Effect para sugerir cores iniciais baseado no tema

  useEffect(() => {
    if (selectedTheme?.thumbnail && activeStep === 0) {
      // Don't auto-extract if we are already in the customization step (activeStep > 0)
      // or if colors are already set by the user.
      const applyThemeColors = async () => {
        try {
          let thumb = selectedTheme.thumbnail;
          // Normalize local relative paths
          if (!thumb.startsWith('http') && !thumb.startsWith('data:') && !thumb.startsWith('/')) {
            thumb = '/' + thumb;
          }

          const dominant = await getDominantColor(thumb);
          const suggestions = suggestColorsForTheme(dominant);
          setCustomizations(prev => ({
            ...prev,
            corFundo: suggestions.backgroundColor,
            textColor: suggestions.textColor
          }));
        } catch (e) {
          console.error("Error suggesting colors:", e);
        }
      };
      applyThemeColors();
    }
  }, [selectedTheme?.thumbnail, selectedTheme?.id, activeStep]); // Triggered on theme change or step change

  const camposNecessarios = useMemo(() => {
    if (!selectedKit || !selectedKit.etiquetas) return [];
    const campos = new Set();
    selectedKit.etiquetas.forEach((etiquetaKit) => {
      const etiquetaInfo = etiquetas.find((e) => e.id === etiquetaKit.id);
      if (etiquetaInfo?.campos) etiquetaInfo.campos.forEach((campo) => campos.add(campo));
    });
    return Array.from(campos);
  }, [selectedKit, etiquetas]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedKit) {
        showMessage("Selecione um kit para continuar.", "warning");
        return;
      }
      if (!selectedTheme) {
        showMessage("Selecione um tema para continuar.", "warning");
        return;
      }
    }
    if (activeStep === 1) {
      if (camposNecessarios.includes("nome") && !customizations.nome) {
        setErrors({ nome: "O nome é obrigatório" });
        showMessage("Preencha o nome para continuar.", "warning");
        return;
      }
    }
    // Finalization is now on the last step (Finalizar Pedido)
    if (activeStep === steps.length - 1) {
      if (!acceptedTerms) {
        showMessage("Você precisa aceitar os Termos e Condições para continuar.", "warning");
        return;
      }
      handleFinalizar();
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const hardReset = () => {
    setSelectedKit(null);
    setSelectedTheme(null);
    setCustomizations({
      nome: "",
      complemento: "",
      turma: "",
      fontFamily: "AgencyFB-Bold",
      textColor: "#FFFFFF",
      corFundo: "#E3F2FD",
      isBold: false,
      isItalic: false,
      fontSizeScale: 1,
      enableAura: false,
      noBackground: false,
      showAreaBorder: false
    });
    setLabelPositions({});
    setActiveStep(0);
    setAcceptedTerms(false);
    setAppliedCoupon(null);
    localStorage.removeItem("pendingCustomization");
  };

  const handleReset = () => {
    if (window.confirm("Deseja realmente reiniciar? Todas as suas escolhas serão perdidas.")) {
      hardReset();
      showMessage("Customização reiniciada.", "info");
    }
  };

  const handleSaveRascunho = async () => {
    if (!user) {
      showMessage("Faça login para salvar um rascunho.", "error");
      return;
    }
    setIsSaving(true);
    setLoadingMessage("Salvando rascunho...");

    try {
      const orderData = {
        user_id: user.id,
        kit_id: selectedKit?.id ? String(selectedKit.id) : null,
        kit_nome: selectedKit?.nome || null,
        kit_preco: selectedKit?.preco ? parseFloat(String(selectedKit.preco).replace("R$", "")) : 0,
        total_amount: selectedKit?.preco ? parseFloat(String(selectedKit.preco).replace("R$", "")) : 0,
        tema_id: selectedTheme?.id ? String(selectedTheme.id) : null,
        tema_nome: selectedTheme?.nome || null,
        status: 'draft',
        customizations: {
          ...customizations,
          labelPositions
        }
      };

      let result;
      if (editingOrderId) {
        result = await supabase.from('orders').update(orderData).eq('id', editingOrderId);
      } else {
        result = await supabase.from('orders').insert([orderData]);
      }

      if (result.error) throw result.error;

      showMessage(editingOrderId ? "Alterações no rascunho salvas!" : "Rascunho salvo com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao salvar rascunho:", err);
      showMessage("Erro ao salvar rascunho.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalizar = async (mode = 'standard') => {
    const isAdminEdit = user?.role === 'admin' && !!editingOrderId;

    if (!user) {
      // Salva o estado atual para retomar após o login
      const pendingData = {
        selectedKit,
        selectedTheme,
        customizations,
        labelPositions,
        activeStep: 2 // Garantimos que ele volte para o passo de revisão
      };
      localStorage.setItem("pendingCustomization", JSON.stringify(pendingData));

      showMessage("Faça login ou cadastre-se para finalizar seu pedido.", "info");
      navigate("/login", { state: { from: "/Customize", message: "Faça login para finalizar seu pedido." } });
      return;
    }
    setIsSaving(true);
    setLoadingMessage("Iniciando processamento...");
    setIsExporting(true);

    try {
      setLoadingMessage("Capturando etiquetas para produção...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Dynamic wait for render
      let container = document.getElementById("etiquetas-container");

      // Fallback if not found immediately (sometimes render takes a beat)
      if (!container) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        container = document.getElementById("etiquetas-container");
      }

      if (!container) throw new Error("Preview container not found.");

      setLoadingMessage("Otimizando imagens para impressão...");
      // 1. Upload original theme asset if it's a base64 image (AI generated)
      let finalOriginalAssetUrl = selectedTheme.thumbnail;
      if (selectedTheme.thumbnail.startsWith('data:image')) {
        setLoadingMessage("Salvando tema gerado por IA...");
        const base64Response = await fetch(selectedTheme.thumbnail);
        const originalBlob = await base64Response.blob();

        // Ensure we have a valid blob type
        const blobWithType = new Blob([originalBlob], { type: 'image/png' });

        const originalFileName = `ai-themes/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('original_assets')
          .upload(originalFileName, blobWithType);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("original_assets").getPublicUrl(uploadData.path);
          finalOriginalAssetUrl = publicUrl;
        }
      }

      // 2. Upload high-res label renders
      const etiquetaElements = container.querySelectorAll(".etiqueta-individual");
      const uploads = [];

      for (let i = 0; i < etiquetaElements.length; i++) {
        setLoadingMessage(`Exportando etiqueta ${i + 1} de ${etiquetaElements.length}...`);
        const el = etiquetaElements[i];
        const content = el.querySelector(".etiqueta-content");

        const canvas = await html2canvas(content, {
          scale: 4,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.getElementById("etiquetas-container");
            if (clonedContainer) {
              clonedContainer.style.transform = "none";
              const handles = clonedDoc.querySelectorAll('.react-resizable-handle, .react-rnd-handle, .text-drag-handle');
              handles.forEach(h => h.style.display = 'none');
              const draggables = clonedDoc.querySelectorAll('.draggable-text-layer');
              draggables.forEach(d => {
                d.style.border = 'none';
                d.style.boxShadow = 'none';
              });
              const characters = clonedDoc.querySelectorAll('.etiqueta-individual .react-rnd');
              characters.forEach(c => {
                c.style.border = 'none';
                c.style.boxShadow = 'none';
              });
            }
          }
        });

        const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
        const fileName = `order_${user.id}_${Date.now()}_${i}.png`;

        setLoadingMessage(`Enviando arquivo ${i + 1} para o servidor...`);
        const { data: uploadResult, error: uploadError } = await supabase.storage.from("etiquetas").upload(fileName, blob);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("etiquetas").getPublicUrl(uploadResult.path);
        uploads.push(publicUrl);
      }

      const cleanPrice = (price) => {
        if (typeof price === 'number') return price;
        if (!price) return 0;
        return parseFloat(price.toString().replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
      };

      const orderData = {
        user_id: user.id,
        kit_id: String(selectedKit.id),
        kit_nome: selectedKit.nome,
        kit_preco: cleanPrice(selectedKit.preco),
        coupon_id: appliedCoupon?.id || null,
        total_amount: (() => {
          const base = cleanPrice(selectedKit.preco);
          const pixDiscount = paymentMethod === 'pix' ? 0.9 : 1.0;
          let total = base * pixDiscount;
          if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percentage') {
              total = total * (1 - appliedCoupon.value / 100);
            } else {
              total = Math.max(0, total - appliedCoupon.value);
            }
          }
          return total;
        })(),
        tema_id: String(selectedTheme.id),
        tema_nome: selectedTheme.nome,
        original_asset_url: finalOriginalAssetUrl,
        customizations: {
          ...customizations,
          textColorRgb: hexToRgb(customizations.textColor),
          textColorCmyk: hexToCmyk(customizations.textColor),
          corFundoRgb: hexToRgb(customizations.corFundo),
          corFundoCmyk: hexToCmyk(customizations.corFundo),
          labelPositions // Store UI positions
        },
        etiquetas_urls: uploads,
        label_metadata: Array.from(etiquetaElements).map((el, i) => {
          const index = el.getAttribute('data-etiqueta-index');
          const draggables = Array.from(el.querySelectorAll('.draggable-text-layer')).map(d => {
            const textContainer = d.querySelector('[data-field-id]');
            const computedStyle = window.getComputedStyle(d);

            // Get internal text container style
            const textStyle = textContainer ? window.getComputedStyle(textContainer) : computedStyle;

            return {
              text: d.innerText.split('\n')[0], // Take only the first line/main text
              field_id: textContainer?.getAttribute('data-field-id'),
              position: {
                x: d.style.left || computedStyle.left,
                y: d.style.top || computedStyle.top,
                raw_x: d.style.left,
                raw_y: d.style.top
              },
              size: {
                width: d.style.width || computedStyle.width,
                height: d.style.height || computedStyle.height
              },
              style: {
                fontFamily: textStyle.fontFamily || customizations.fontFamily,
                fontSize: textContainer?.getAttribute('data-font-size') || textStyle.fontSize,
                color: textStyle.color || customizations.textColor,
                fontWeight: textStyle.fontWeight,
                fontStyle: textStyle.fontStyle,
                isBold: customizations.isBold,
                isItalic: customizations.isItalic
              }
            };
          });

          return {
            label_id: index,
            etiqueta_nome: el.querySelector('p')?.innerText || `Etiqueta ${i}`,
            texts: draggables,
            background: {
              color: customizations.corFundo,
              cmyk: hexToCmyk(customizations.corFundo)
            }
          };
        }),
        status: "pending",
        customer_email: user.email,
        customer_name: user.name || '',
        customer_phone: user.phone || '',
        customer_cpf: user.cpf || '',
        delivery_info: deliveryInfo,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod
      };

      // Ensure some fields are definitely present in orderData
      const orderDataFinal = {
        ...orderData,
        customizations: {
          ...orderData.customizations,
          corFundo: customizations.corFundo,
          textColor: customizations.textColor,
          fontFamily: customizations.fontFamily,
          fontSizeScale: customizations.fontSizeScale
        }
      };

      setLoadingMessage("Registrando seu pedido...");
      console.log("Tentando processar pedido com modo:", mode);

      let finalOrder;
      if (mode === 'update' && editingOrderId) {
        setLoadingMessage("Atualizando pedido existente...");
        const { data, error: updateError } = await supabase
          .from("orders")
          .update({
            customizations: orderDataFinal.customizations,
            etiquetas_urls: orderDataFinal.etiquetas_urls,
            label_metadata: orderDataFinal.label_metadata,
            original_asset_url: orderDataFinal.original_asset_url
          })
          .eq('id', editingOrderId)
          .select()
          .single();
        if (updateError) throw updateError;
        finalOrder = data;

        await supabase.from('access_logs').insert({
          user_id: user.id,
          event_type: 'admin_update',
          description: `Admin atualizou o design do pedido: ${editingOrderId}`
        });
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("orders")
          .insert({
            ...orderDataFinal,
            status: mode === 'admin_copy' ? 'producao' : 'pending'
          })
          .select()
          .single();
        if (insertError) throw insertError;
        finalOrder = insertData;

        if (selectedTheme?.isAiBackground) {
          setLoadingMessage("Adicionando tema à coleção pública...");
          try {
            const aiThemeId = `ai_theme_${Date.now()}`;
            const { error: themeError } = await supabase
              .from('temas')
              .insert({
                id: aiThemeId, // Mandatory Text ID
                nome: selectedTheme.nome || 'Novo Tema IA',
                thumbnail: finalOriginalAssetUrl,
                original_asset_url: finalOriginalAssetUrl,
                is_ai_generated: true,
                categoria_id: (await supabase.from('tema_categorias').select('id').eq('slug', 'geral').single()).data?.id,
                is_active: true
              });
            if (themeError) console.error("Error adding AI theme to portfolio:", themeError);
          } catch (e) {
            console.error("Error in AI portfolio logic:", e);
          }
        }

        // NEW: If a coupon was used, increment its usage count and log it
        if (appliedCoupon) {
          try {
            await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
            await supabase.from('coupon_usages').insert({
              coupon_id: appliedCoupon.id,
              order_id: finalOrder.id,
              user_id: user?.id
            });
          } catch (e) {
            console.error("Error recording coupon usage:", e);
          }
        }

        await supabase.from('access_logs').insert({
          user_id: user.id,
          event_type: mode === 'admin_copy' ? 'admin_copy' : 'purchase',
          description: mode === 'admin_copy' ? `Admin gerou cópia especial: ${finalOrder.id}` : `Novo pedido: ${finalOrder.id}`
        });
      }

      // Save address to profile if logged in
      if (user && deliveryMethod === 'uber') {
        await supabase.from('profiles').update({
          address_cep: deliveryInfo.cep,
          address_street: deliveryInfo.rua,
          address_number: deliveryInfo.numero,
          address_complement: deliveryInfo.complemento,
          address_neighborhood: deliveryInfo.bairro,
          address_city: deliveryInfo.cidade,
          address_state: deliveryInfo.estado
        }).eq('id', user.id);
      }

      setLoadingMessage("Limpando carrinho...");
      await clearCart();

      // Reseta tudo após finalização bem sucedida
      hardReset();

      setLoadingMessage("Finalizado!");
      showMessage(mode === 'update' ? "Pedido atualizado!" : `Olá ${user?.name || 'Cliente'}, seu pedido foi criado com sucesso!`, "success");
      navigate(`/order/${finalOrder.id}`);

      setLoadingMessage(mode === 'update' ? "✅ Design atualizado!" : "✅ Equipe de produção notificada!");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLoadingMessage(mode === 'update' ? "Design atualizado com sucesso!" : "Pedido concluído com sucesso!");
      setFinalizeSuccess(true);

      // Add WhatsApp button after checkout if it's Uber delivery
      const whatsappMsg = encodeURIComponent("Olá! Acabei de fazer um pedido e gostaria de combinar o frete via Uber para o meu endereço.");
      const whatsappUrl = `https://wa.me/5561999999999?text=${whatsappMsg}`;

      setLoadingMessage(
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Olá {user?.name || 'Cliente'}! Seu pedido foi realizado!</Typography>
          {deliveryMethod === 'uber' && (
            <Button
              variant="contained"
              color="success"
              href={whatsappUrl}
              target="_blank"
              sx={{ mt: 2, borderRadius: '12px' }}
            >
              Combinar Frete p/ WhatsApp
            </Button>
          )}
        </Box>
      );

      setIsSaving(false);
      setIsExporting(false);
      setLoadingMessage("");
      clearCart();

    } catch (err) {
      console.error("Erro ao finalizar:", err);
      showMessage(err.message || "Erro ao criar pedido.", "error");
      setIsSaving(false);
      setIsExporting(false);
      setLoadingMessage("");
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    setAiIndividualPrompts({});
    const seed = Math.floor(Math.random() * 2147483647);
    setBaseAiSeed(seed);
    try {
      const images = await generateThemeImages(aiPrompt, seed);
      setAiGeneratedImages(images);
    } catch (err) {
      setAiError("Erro ao gerar temas.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleIndividualAiGenerate = async (index, customPrompt = null) => {
    // Determine the base prompt and the refinement
    const refinement = customPrompt || aiIndividualPrompts[index];
    const originalBase = aiGeneratedImages[index]?.prompt || aiPrompt;

    if (!refinement && !customPrompt) return; // Nothing to do

    let promptToUse = refinement || originalBase;

    if (refinement && refinement !== originalBase) {
      // Provide context + modification instruction
      promptToUse = `Refine o tema "${originalBase}": ${refinement}. Mantenha rigorosamente o estilo visual, cores e a composição.`;
    }

    // Use the specific seed of the image being refined for consistency
    const seedToUse = aiGeneratedImages[index]?.seed || baseAiSeed;

    setIndividualGenerating(prev => ({ ...prev, [index]: true }));
    try {
      const result = await generateThemeImages(promptToUse, seedToUse);
      if (result && result.length > 0) {
        const newImage = result[0];
        setAiGeneratedImages(prev => {
          const newList = [...prev];
          newList[index] = { ...newImage, prompt: promptToUse };
          return newList;
        });
      }
    } catch (err) {
      console.error("AI Individual Generation Error:", err);
      showMessage("Não foi possível alterar esta imagem. Tente novamente.", "error");
    } finally {
      setIndividualGenerating(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleShare = async () => {
    const container = document.getElementById("etiquetas-container");
    if (!container) return;

    setIsSaving(true);
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], "meu-design-duetags.png", { type: "image/png" });
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Olha que lindas minhas etiquetas da DueTags!",
              text: "Acabei de criar essas etiquetas personalizadas. O que achou?",
              files: [file],
            });
          } catch (e) {
            console.log("Share failed or cancelled", e);
          }
        } else {
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "meu-design-duetags.png";
          link.click();
          showMessage("Imagem baixada! Agora você pode compartilhar nas redes sociais.", "success");
        }
      });
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
      showMessage("Erro ao gerar imagem para compartilhar.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box p={4} sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" align="center" gutterBottom>Personalize suas Etiquetas</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        p={2}
        sx={{
          bgcolor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', ml: 1 }}>
            {steps[activeStep]}
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
            Passo {activeStep + 1} de {steps.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 10 }}>
        {(isLoadingOrder || isProductsLoading) ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="50vh">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              {isProductsLoading ? "Carregando catálogo de produtos..." : "Carregando pedido para edição..."}
            </Typography>
          </Box>
        ) : (
          <>
            {activeStep === 0 && (
              <Box>
                {!selectedKit ? (
                  <KitSelectionStep kits={kits} etiquetas={etiquetas} selectedKit={selectedKit} onSelectKit={(k) => { setSelectedKit(normalizeKit(k)); }} />
                ) : (
                  <ThemeSelectionStep
                    temas={temas}
                    categorias={categorias}
                    selectedTheme={selectedTheme}
                    onSelectTheme={(t) => { setSelectedTheme(t); setActiveStep(1); }}
                    onOpenAiModal={() => setOpenAiModal(true)}
                    onBackToKits={() => setSelectedKit(null)}
                  />
                )}
              </Box>
            )}

            {activeStep === 1 && selectedKit && (
              <CustomizationStep
                selectedKit={selectedKit} selectedTheme={selectedTheme}
                customizations={customizations} setCustomizations={setCustomizations}
                camposNecessarios={camposNecessarios} errors={errors}
                labelPositions={labelPositions} handleLabelPositionChange={handleLabelPositionChange}
                fontesDisponiveis={fontesDisponiveis}
                onChangeStep={setActiveStep}
                setSelectedKit={setSelectedKit}
                etiquetas={etiquetas}
              />
            )}

            {activeStep === 2 && selectedKit && (
              <ReviewStep
                selectedKit={selectedKit}
                selectedTheme={selectedTheme}
                customizations={customizations}
                labelPositions={labelPositions}
                isSaving={isSaving}
                onSaveRascunho={handleSaveRascunho}
                onFinalizar={handleFinalizar}
                onShare={handleShare}
                etiquetas={etiquetas}
                deliveryInfo={deliveryInfo}
                setDeliveryInfo={setDeliveryInfo} // New: allow editing in Review
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod} // New: allow editing in Review
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
              />
            )}

            {activeStep > 0 && !selectedKit && (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="40vh">
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                  Aguardando seleção do kit...
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Hidden container for High-Quality Capture (Always present for handleFinalizar) */}
      {selectedKit && (
        <Box sx={{ position: 'absolute', left: -9999, top: 0, opacity: 0, pointerEvents: 'none' }}>
          <Box id="etiquetas-container">
            <Etiquetas
              kit={selectedKit}
              theme={selectedTheme}
              customizations={customizations}
              zoom={3} // Higher zoom for final file quality
              positions={labelPositions}
              etiquetas={etiquetas}
              isExport={true}
              isCapture={true}
            />
          </Box>
        </Box>
      )}

      {/* Design Review Modal */}
      <Dialog open={showDesignModal} onClose={() => setShowDesignModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Prévia do Design
          <IconButton onClick={() => setShowDesignModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
              <Etiquetas
                kit={selectedKit}
                theme={selectedTheme}
                customizations={customizations}
                zoom={1.5}
                positions={labelPositions}
                etiquetas={etiquetas}
                isExport={true}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDesignModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Footer Fixo de Navegação */}
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'white',
          zIndex: 1100,
          borderTop: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Box display="flex" gap={2}>
          <Button
            onClick={handleReset}
            variant="text"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Reiniciar
          </Button>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              variant="outlined"
              sx={{ px: 4, borderRadius: '10px', textTransform: 'none' }}
            >
              Voltar
            </Button>
          )}
        </Box>

        <Box display="flex" gap={2}>
          {user?.role === 'admin' && editingOrderId ? (
            <>
              <Button
                onClick={() => handleFinalizar('update')}
                variant="contained"
                color="info"
                disabled={isSaving}
                sx={{ px: 4, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
              >
                Atualizar Design (Fixo)
              </Button>
              <Button
                onClick={() => handleFinalizar('admin_copy')}
                variant="contained"
                color="secondary"
                disabled={isSaving}
                sx={{ px: 4, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
              >
                Salvar como Novo (Admin)
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={isSaving || (activeStep === steps.length - 1 && !acceptedTerms)}
              sx={{
                px: 6, py: 1.5, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {activeStep === steps.length - 1 ? "Fechar o Pedido" : "Próximo Passo"}
            </Button>
          )}
        </Box>
      </Paper>

      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      {/* AI Modal */}
      <Dialog open={openAiModal} onClose={() => setOpenAiModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}><AutoAwesomeIcon color="secondary" /> Criar com IA</Box>
          <IconButton onClick={() => setOpenAiModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ bgcolor: 'rgba(186, 179, 255, 0.1)', p: 2, borderRadius: 2, mb: 2, border: '1px solid rgba(186, 179, 255, 0.3)' }}>
              <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                💡 Dica para um tema incrível:
              </Typography>
              <Typography variant="caption" color="textSecondary" component="div">
                Descreva o tema, estilo e para quem é. <br />
                <strong>Exemplo:</strong> "Dinossauros fofos em estilo aquarela, tons pastéis, para menino de 3 anos." <br />
                <em>Considere citar se é para bebê, criança escolar ou berçário.</em>
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Descreva o tema das suas etiquetas..."
                placeholder="Ex: Unicórnios mágicos com arco-íris"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                sx={{ borderRadius: 2, px: 4 }}
              >
                {aiGenerating ? <CircularProgress size={24} /> : "Gerar"}
              </Button>
            </Box>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" sx={{ minHeight: '300px', alignItems: 'center' }}>
            {aiGenerating && (
              <Box textAlign="center" width="100%" py={4}>
                <CircularProgress color="secondary" size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: 'secondary.main', animation: 'pulse 1.5s infinite' }}>
                  Criando etiquetas mágicas para você...
                </Typography>
                <style>
                  {`
                    @keyframes pulse {
                      0% { opacity: 0.6; transform: scale(1); }
                      50% { opacity: 1; transform: scale(1.05); }
                      100% { opacity: 0.6; transform: scale(1); }
                    }
                    `}
                </style>
              </Box>
            )}
            {!aiGenerating && aiGeneratedImages.length === 0 && !aiError && (
              <Typography color="textSecondary">Descreva o tema acima e clique em "Gerar" para começar!</Typography>
            )}
            {!aiGenerating && aiGeneratedImages.map((img, i) => (
              <Box
                key={i}
                sx={{
                  width: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 1,
                  borderRadius: 3,
                  border: tempSelectedAiImage === i ? '4px solid #bab3ff' : '4px solid transparent',
                  transition: 'all 0.3s'
                }}
              >
                <Box
                  component="img"
                  src={img.url}
                  crossOrigin="anonymous"
                  sx={{
                    width: '100%',
                    cursor: 'pointer',
                    borderRadius: 2,
                    boxShadow: tempSelectedAiImage === i ? '0 8px 24px rgba(186, 179, 255, 0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => setTempSelectedAiImage(i)}
                />
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Refinar imagem..."
                    value={aiIndividualPrompts[i] || ""}
                    onChange={(e) => setAiIndividualPrompts(prev => ({ ...prev, [i]: e.target.value }))}
                    disabled={individualGenerating[i]}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => handleIndividualAiGenerate(i)}
                    disabled={individualGenerating[i]}
                    sx={{ minWidth: '70px' }}
                  >
                    {individualGenerating[i] ? <CircularProgress size={16} /> : "Alterar"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>

          {aiGeneratedImages.length > 0 && (
            <Box sx={{ mt: 4, textAlign: 'center', p: 3, bgcolor: 'rgba(186, 179, 255, 0.05)', borderRadius: 4, border: '1px dashed #bab3ff' }}>
              {!tempSelectedAiImage && tempSelectedAiImage !== 0 ? (
                <Typography color="secondary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, animation: 'pulse-text 2s infinite' }}>
                  ✨ Toque em uma imagem para selecioná-la e continuar!
                </Typography>
              ) : (
                <Box>
                  <Typography variant="body2" color="secondary" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Excelente escolha! Clique abaixo para usar esta imagem.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 8, py: 2, borderRadius: '50px', fontWeight: '900',
                      bgcolor: '#bab3ff', color: '#4a148c',
                      fontSize: '1.1rem',
                      boxShadow: '0 8px 32px rgba(186, 179, 255, 0.5)',
                      '&:hover': { bgcolor: '#9c92f0', transform: 'scale(1.05)' },
                      animation: 'pulse-lilac 2s infinite',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => {
                      const img = aiGeneratedImages[tempSelectedAiImage];
                      setSelectedTheme({
                        id: `ai-${tempSelectedAiImage}`,
                        nome: aiIndividualPrompts[tempSelectedAiImage] || aiPrompt,
                        thumbnail: img.url,
                        isAiBackground: true
                      });
                      setOpenAiModal(false);
                      setActiveStep(1);
                    }}
                  >
                    CONTINUAR COM ESTE TEMA
                  </Button>
                </Box>
              )}
              <style>
                {`
                  @keyframes pulse-lilac {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(186, 179, 255, 0.6); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(186, 179, 255, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(186, 179, 255, 0); }
                  }
                  @keyframes pulse-text {
                    0% { opacity: 0.7; transform: translateY(0); }
                    50% { opacity: 1; transform: translateY(-3px); }
                    100% { opacity: 0.7; transform: translateY(0); }
                  }
                `}
              </style>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Finalization Loading Backdrop */}
      <Dialog
        open={isSaving}
        PaperProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: 'none',
            overflow: 'hidden',
            borderRadius: '24px',
            padding: '20px'
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
          <CircularProgress size={80} thickness={4} color="primary" />
          <Typography variant="h5" sx={{ mt: 4, fontWeight: 'bold', color: 'primary.main' }}>
            Finalizando seu Pedido
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', minHeight: '24px' }}>
            {loadingMessage || "Processando suas etiquetas..."}
          </Typography>
          <Typography variant="caption" sx={{ mt: 4, display: 'block', fontStyle: 'italic', opacity: 0.7 }}>
            Isso pode levar alguns segundos, por favor não feche esta janela.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Customize;
