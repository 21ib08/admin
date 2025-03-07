"use client";

import {
  Mail,
  Clock,
  Send,
  Search,
  RefreshCw,
  Trash2,
  X,
  CalendarIcon,
  MessageSquare,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import supabase from "@/database/supabase";

interface Inquiry {
  id: number;
  email: string | null;
  is_read: boolean;
  message: string | null;
  type: string | null;
  created_at: string;
}

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  // Define inquiry types
  const inquiryTypes = [
    { value: "rezervace", label: "Rezervace" },
    { value: "special", label: "Speciální požadavky" },
    { value: "sluzby", label: "Hotelové služby" },
    { value: "vazba", label: "Zpětná vazba" },
    { value: "ostani", label: "Ostatní" },
  ];

  // Fetch inquiries from Supabase
  useEffect(() => {
    async function fetchInquiries() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Transform data to ensure it matches our interface
        const formattedData = (data || []).map((item) => ({
          ...item,
          is_read: item.is_read === null ? false : item.is_read, // Handle null is_read values
          // Convert numeric ID to number if needed
          id: typeof item.id === "string" ? parseInt(item.id, 10) : item.id,
        }));

        setInquiries(formattedData);
        setFilteredInquiries(formattedData);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        toast({
          title: "Chyba při načítání dotazů",
          description: "Nepodařilo se načíst dotazy zákazníků.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchInquiries();
  }, [toast]);

  // Filter inquiries based on search and type
  useEffect(() => {
    let result = inquiries;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inq) =>
          inq.email?.toLowerCase().includes(query) ||
          false ||
          inq.message?.toLowerCase().includes(query) ||
          false
      );
    }

    // Apply type filter (only if not "all")
    if (typeFilter && typeFilter !== "all") {
      result = result.filter((inq) => inq.type === typeFilter);
    }

    setFilteredInquiries(result);
  }, [inquiries, searchQuery, typeFilter]);

  // Mark as read when selected
  useEffect(() => {
    if (selectedInquiry && selectedInquiry.is_read === false) {
      async function markAsRead() {
        try {
          const { error } = await supabase
            .from("inquiries")
            .update({ is_read: true })
            .eq("id", selectedInquiry?.id);

          if (error) {
            throw error;
          }

          // Update local state
          setInquiries((prevInquiries) =>
            prevInquiries.map((inq) =>
              inq.id === selectedInquiry?.id ? { ...inq, is_read: true } : inq
            )
          );
          // Also update the selected inquiry
          setSelectedInquiry((prevInquiry) =>
            prevInquiry ? { ...prevInquiry, is_read: true } : null
          );
        } catch (error) {
          console.error("Error marking inquiry as read:", error);
        }
      }

      markAsRead();
    }
  }, [selectedInquiry]);

  const handleSendReply = useCallback(() => {
    if (!selectedInquiry || !replyText.trim()) return;

    setSending(true);

    // Here you would typically send the reply via email or another service
    // For now, we'll just mark it as handled by deleting it from the database
    async function sendReplyAndRemove() {
      try {
        // Delete from Supabase
        const { error } = await supabase
          .from("inquiries")
          .delete()
          .eq("id", selectedInquiry?.id);

        if (error) {
          throw error;
        }

        // Remove from local state
        const updatedInquiries = inquiries.filter(
          (inq) => inq.id !== selectedInquiry?.id
        );

        setInquiries(updatedInquiries);
        setFilteredInquiries((prevFiltered) =>
          prevFiltered.filter((inq) => inq.id !== selectedInquiry?.id)
        );
        setSelectedInquiry(null); // Clear selection since the inquiry is now gone
        setReplyText("");

        toast({
          title: "Odpověď odeslána",
          description: `Dotaz byl vyřešen a odstraněn ze seznamu.`,
          variant: "default",
        });
      } catch (error) {
        console.error("Chyba při odesílání odpovědi:", error);
        toast({
          title: "Chyba při odesílání",
          description: "Nepodařilo se odeslat odpověď. Zkuste to prosím znovu.",
          variant: "destructive",
        });
      } finally {
        setSending(false);
      }
    }

    sendReplyAndRemove();
  }, [selectedInquiry, replyText, inquiries, toast]);

  const handleDeleteInquiry = useCallback(
    (id: number) => {
      setDeleting(id);

      async function deleteInquiry() {
        try {
          // Delete from Supabase
          const { error } = await supabase
            .from("inquiries")
            .delete()
            .eq("id", id);

          if (error) {
            throw error;
          }

          // Remove from local state
          setInquiries((prevInquiries) =>
            prevInquiries.filter((inq) => inq.id !== id)
          );

          setFilteredInquiries((prevFiltered) =>
            prevFiltered.filter((inq) => inq.id !== id)
          );

          // If the deleted inquiry was selected, clear the selection
          if (selectedInquiry?.id === id) {
            setSelectedInquiry(null);
            setReplyText("");
          }

          toast({
            title: "Dotaz odstraněn",
            description: "Dotaz byl úspěšně odstraněn ze seznamu.",
            variant: "default",
          });
        } catch (error) {
          console.error("Chyba při odstraňování dotazu:", error);
          toast({
            title: "Chyba při odstraňování",
            description:
              "Nepodařilo se odstranit dotaz. Zkuste to prosím znovu.",
            variant: "destructive",
          });
        } finally {
          setDeleting(null);
        }
      }

      deleteInquiry();
    },
    [selectedInquiry, toast]
  );

  // Get type label for display
  const getTypeLabel = (type: string | null) => {
    if (!type) return "Neznámý typ";

    const foundType = inquiryTypes.find((t) => t.value === type);
    return foundType ? foundType.label : "Neznámý typ";
  };

  // Helper function for type colors
  function getTypeColor(type: string | null): string {
    if (!type) return "";

    switch (type) {
      case "reservation":
        return "text-blue-500 border-blue-500 dark:text-blue-400 dark:border-blue-400";
      case "special":
        return "text-purple-500 border-purple-500 dark:text-purple-400 dark:border-purple-400";
      case "services":
        return "text-green-500 border-green-500 dark:text-green-400 dark:border-green-400";
      case "feedback":
        return "text-amber-500 border-amber-500 dark:text-amber-400 dark:border-amber-400";
      case "other":
        return "text-gray-500 border-gray-500 dark:text-gray-400 dark:border-gray-400";
      default:
        return "";
    }
  }

  // Skeleton loading component for inquiry list
  const InquiryListSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b">
          <div className="flex justify-between items-start mb-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <Card className="border shadow-sm">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)]">
          {/* Left sidebar - list of inquiries */}
          <div
            className={`${
              selectedInquiry && "hidden lg:flex"
            } w-full lg:w-96 border-b lg:border-r lg:border-b-0 dark:border-gray-800 overflow-hidden flex flex-col`}
          >
            <div className="p-3 sm:p-5 border-b dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-3 sm:mb-4">
                Dotazy zákazníků
              </h2>
              <div className="relative mb-3 sm:mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat dotazy..."
                  className="pl-9 bg-background dark:bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full bg-background dark:bg-background">
                  <SelectValue placeholder="Filtrovat podle typu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny typy</SelectItem>
                  {inquiryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y dark:divide-gray-800">
                {loading ? (
                  <InquiryListSkeleton />
                ) : filteredInquiries.length > 0 ? (
                  <AnimatePresence>
                    {filteredInquiries.map((inquiry) => (
                      <motion.div
                        key={inquiry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          transition: { duration: 0.3 },
                        }}
                        layout
                        className="relative"
                      >
                        <div
                          onClick={() => setSelectedInquiry(inquiry)}
                          className={`p-3 sm:p-4 cursor-pointer hover:bg-accent/50 transition-colors relative
                            ${
                              selectedInquiry?.id === inquiry.id
                                ? "bg-accent/50"
                                : ""
                            }
                            ${
                              !inquiry.is_read
                                ? "border-l-4 border-primary pl-2 sm:pl-3"
                                : ""
                            }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-0.5 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                                {inquiry.email
                                  ? inquiry.email.split("@")[0]
                                  : ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1 flex-wrap sm:flex-nowrap">
                                <span
                                  className={`truncate ${
                                    !inquiry.is_read ? "font-semibold" : ""
                                  } mr-2`}
                                >
                                  {inquiry.email
                                    ? inquiry.email.split("@")[0]
                                    : ""}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5 sm:mt-0">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getTypeColor(
                                      inquiry.type
                                    )}`}
                                  >
                                    {getTypeLabel(inquiry.type)}
                                  </Badge>
                                </div>
                              </div>
                              <div
                                className={`text-sm text-muted-foreground truncate ${
                                  !inquiry.is_read
                                    ? "font-medium text-foreground"
                                    : ""
                                }`}
                              >
                                {inquiry.message
                                  ? inquiry.message.substring(0, 40)
                                  : ""}
                                ...
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {inquiry.created_at
                                    ? new Date(
                                        inquiry.created_at
                                      ).toLocaleDateString("cs-CZ")
                                    : ""}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {inquiry.email
                                    ? inquiry.email.split("@")[0]
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteInquiry(inquiry.id);
                                  }}
                                  className="absolute right-2 sm:right-3 top-2 sm:top-3 opacity-0 hover:opacity-100 focus:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 transition-all"
                                  aria-label="Odstranit dotaz"
                                >
                                  {deleting === inquiry.id ? (
                                    <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 text-destructive" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Odstranit dotaz</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                    <p className="text-base sm:text-lg font-medium mb-1">
                      Žádné dotazy
                    </p>
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                      Nebyly nalezeny žádné dotazy odpovídající filtrům
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setTypeFilter("all");
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Resetovat filtry
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - message detail and reply */}
          <div
            className={`${
              !selectedInquiry && "hidden lg:flex"
            } flex-1 flex flex-col bg-card dark:bg-card overflow-hidden`}
          >
            {/* Back button for mobile */}
            {selectedInquiry && (
              <div className="lg:hidden p-3 border-b dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInquiry(null)}
                  className="flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Zpět na seznam
                </Button>
              </div>
            )}

            {loading ? (
              <div className="p-4 sm:p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Skeleton className="h-7 w-36 sm:w-48 mb-2" />
                    <Skeleton className="h-4 w-24 sm:w-32" />
                  </div>
                  <Skeleton className="h-4 w-20 sm:w-24" />
                </div>
                <Skeleton className="h-24 sm:h-32 w-full mt-4 sm:mt-6" />
                <div className="mt-4 sm:mt-6">
                  <Skeleton className="h-5 w-24 sm:w-32 mb-2" />
                  <Skeleton className="h-32 sm:h-40 w-full mb-4" />
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 sm:h-10 w-16 sm:w-20" />
                    <Skeleton className="h-9 sm:h-10 w-32 sm:w-40" />
                  </div>
                </div>
              </div>
            ) : selectedInquiry ? (
              <>
                <div className="p-4 sm:p-6 border-b dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-lg">
                          {selectedInquiry?.email
                            ? selectedInquiry.email.split("@")[0]
                            : ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h2 className="text-lg sm:text-xl font-semibold">
                            {selectedInquiry?.email
                              ? selectedInquiry.email.split("@")[0]
                              : ""}
                          </h2>
                          <Badge
                            variant="outline"
                            className={getTypeColor(selectedInquiry?.type)}
                          >
                            {getTypeLabel(selectedInquiry?.type)}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">
                              {selectedInquiry?.email
                                ? selectedInquiry.email
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {selectedInquiry?.created_at
                              ? new Date(
                                  selectedInquiry.created_at
                                ).toLocaleDateString("cs-CZ")
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10 self-end sm:self-auto"
                            onClick={() =>
                              handleDeleteInquiry(selectedInquiry?.id)
                            }
                            disabled={deleting === selectedInquiry?.id}
                          >
                            {deleting === selectedInquiry?.id ? (
                              <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Odstranit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Odstranit tento dotaz</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Card className="bg-accent/50 p-3 sm:p-4 rounded-lg border dark:border-gray-800">
                    <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                      {selectedInquiry?.message ? selectedInquiry.message : ""}
                    </div>
                  </Card>
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Vaše odpověď
                    </h3>
                  </div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Napište odpověď..."
                    className="flex-1 resize-none mb-4 bg-background dark:bg-background min-h-[120px] sm:min-h-[200px] text-sm sm:text-base p-3 sm:p-4"
                  />
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 sm:gap-0">
                    <div className="flex gap-2 justify-center sm:justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedInquiry(null);
                          setReplyText("");
                        }}
                      >
                        Zrušit
                      </Button>
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sending}
                        className="flex items-center gap-2 min-w-[140px]"
                      >
                        {sending ? (
                          <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Odesílání...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Odeslat odpověď
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 sm:p-6">
                <div className="bg-accent/30 p-6 sm:p-8 rounded-lg border border-border flex flex-col items-center max-w-md">
                  <Mail className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4 opacity-20" />
                  <h3 className="text-lg sm:text-xl font-medium mb-2">
                    Žádný dotaz není vybrán
                  </h3>
                  <p className="text-center text-sm sm:text-base mb-4 sm:mb-6">
                    Vyberte dotaz ze seznamu vlevo nebo použijte vyhledávání pro
                    nalezení konkrétního dotazu.
                  </p>
                  {filteredInquiries.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedInquiry(filteredInquiries[0])}
                    >
                      Zobrazit první dotaz
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
