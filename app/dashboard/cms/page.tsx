"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Code, FileJson, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

// Add new interface for JSON content
interface JsonContent {
  id: string;
  name: string;
  path: string;
  content: {
    cs: string;
    en: string;
  };
  lastEdited: Date;
}

export default function CMSPage() {
  // Add new state variables for JSON editing
  const [activeJsonTab, setActiveJsonTab] = useState<string | null>(null);
  const [jsonContents, setJsonContents] = useState<JsonContent[]>([]);
  const [currentJsonContent, setCurrentJsonContent] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Přidejte nové stavové proměnné pro vícejazyčný editor
  const [activeLanguage, setActiveLanguage] = useState<"cs" | "en">("cs");
  const [currentJsonContentEn, setCurrentJsonContentEn] = useState<string>("");
  const [jsonErrorEn, setJsonErrorEn] = useState<string | null>(null);

  // Upravte mock JSON soubory pro podporu více jazyků
  useEffect(() => {
    const mockJsonFiles: JsonContent[] = [
      {
        id: "home-hero",
        name: "Homepage Hero Content",
        path: "/content/home-hero.json",
        content: {
          cs: JSON.stringify(
            {
              title: "Vítejte v našem luxusním hotelu",
              subtitle: "Zažijte pohodlí a eleganci v srdci města",
              buttonText: "Rezervovat pokoj",
              buttonLink: "/rezervace",
              images: [
                "/images/hero1.jpg",
                "/images/hero2.jpg",
                "/images/hero3.jpg",
              ],
            },
            null,
            2
          ),
          en: JSON.stringify(
            {
              title: "Welcome to our luxury hotel",
              subtitle:
                "Experience comfort and elegance in the heart of the city",
              buttonText: "Book a room",
              buttonLink: "/reservation",
              images: [
                "/images/hero1.jpg",
                "/images/hero2.jpg",
                "/images/hero3.jpg",
              ],
            },
            null,
            2
          ),
        },
        lastEdited: new Date("2023-11-10"),
      },
      {
        id: "rooms-data",
        name: "Rooms Data",
        path: "/content/rooms.json",
        content: {
          cs: JSON.stringify(
            {
              rooms: [
                {
                  id: "standard",
                  name: "Standardní pokoj",
                  description: "Komfortní pokoj s veškerým základním vybavením",
                  price: 2500,
                  capacity: 2,
                  amenities: ["wifi", "tv", "bathroom", "desk"],
                },
                {
                  id: "deluxe",
                  name: "Deluxe pokoj",
                  description:
                    "Prostorný pokoj s luxusním vybavením a výhledem",
                  price: 4000,
                  capacity: 2,
                  amenities: [
                    "wifi",
                    "tv",
                    "bathroom",
                    "minibar",
                    "safe",
                    "balcony",
                  ],
                },
              ],
            },
            null,
            2
          ),
          en: JSON.stringify(
            {
              rooms: [
                {
                  id: "standard",
                  name: "Standard Room",
                  description: "Comfortable room with all basic amenities",
                  price: 2500,
                  capacity: 2,
                  amenities: ["wifi", "tv", "bathroom", "desk"],
                },
                {
                  id: "deluxe",
                  name: "Deluxe Room",
                  description: "Spacious room with luxury amenities and a view",
                  price: 4000,
                  capacity: 2,
                  amenities: [
                    "wifi",
                    "tv",
                    "bathroom",
                    "minibar",
                    "safe",
                    "balcony",
                  ],
                },
              ],
            },
            null,
            2
          ),
        },
        lastEdited: new Date("2023-10-25"),
      },
      {
        id: "contact-info",
        name: "Contact Information",
        path: "/content/contact.json",
        content: {
          cs: JSON.stringify(
            {
              address: "Václavské náměstí 1, Praha 1, 110 00",
              phone: "+420 123 456 789",
              email: "info@hotel.cz",
              socialMedia: {
                facebook: "https://facebook.com/hotelname",
                instagram: "https://instagram.com/hotelname",
                twitter: "https://twitter.com/hotelname",
              },
              openingHours: {
                reception: "24/7",
                restaurant: "7:00 - 22:00",
                spa: "9:00 - 21:00",
              },
            },
            null,
            2
          ),
          en: JSON.stringify(
            {
              address: "Wenceslas Square 1, Prague 1, 110 00",
              phone: "+420 123 456 789",
              email: "info@hotel.com",
              socialMedia: {
                facebook: "https://facebook.com/hotelname",
                instagram: "https://instagram.com/hotelname",
                twitter: "https://twitter.com/hotelname",
              },
              openingHours: {
                reception: "24/7",
                restaurant: "7:00 - 22:00",
                spa: "9:00 - 21:00",
              },
            },
            null,
            2
          ),
        },
        lastEdited: new Date("2023-11-05"),
      },
    ];

    setJsonContents(mockJsonFiles);
  }, []);

  // Upravte funkci pro výběr JSON souboru
  const handleSelectJson = (jsonId: string) => {
    setActiveJsonTab(jsonId);
    const selectedJson = jsonContents.find((json) => json.id === jsonId);
    if (selectedJson) {
      setCurrentJsonContent(selectedJson.content.cs);
      setCurrentJsonContentEn(selectedJson.content.en);
      setJsonError(null);
      setJsonErrorEn(null);
    }
  };

  // Upravte funkci pro validaci JSON
  const validateJson = useCallback(
    (jsonString: string, language: "cs" | "en"): boolean => {
      try {
        JSON.parse(jsonString);
        if (language === "cs") {
          setJsonError(null);
        } else {
          setJsonErrorEn(null);
        }
        return true;
      } catch (error) {
        if (error instanceof Error) {
          if (language === "cs") {
            setJsonError(error.message);
          } else {
            setJsonErrorEn(error.message);
          }
        } else {
          if (language === "cs") {
            setJsonError("Invalid JSON format");
          } else {
            setJsonErrorEn("Invalid JSON format");
          }
        }
        return false;
      }
    },
    []
  );

  // Upravte funkci pro změnu obsahu JSON
  const handleJsonContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, language: "cs" | "en") => {
      if (language === "cs") {
        setCurrentJsonContent(e.target.value);
        if (jsonError) {
          const timeoutId = setTimeout(() => {
            validateJson(e.target.value, "cs");
          }, 1000);
          return () => clearTimeout(timeoutId);
        }
      } else {
        setCurrentJsonContentEn(e.target.value);
        if (jsonErrorEn) {
          const timeoutId = setTimeout(() => {
            validateJson(e.target.value, "en");
          }, 1000);
          return () => clearTimeout(timeoutId);
        }
      }
    },
    [jsonError, jsonErrorEn, validateJson]
  );

  // Upravte funkci pro uložení JSON
  const handleSaveJson = () => {
    if (!activeJsonTab) return;

    const isValidCs = validateJson(currentJsonContent, "cs");
    const isValidEn = validateJson(currentJsonContentEn, "en");

    if (!isValidCs || !isValidEn) return;

    setIsSaving(true);

    // Simulace API volání pro uložení JSON
    setTimeout(() => {
      setJsonContents((prevContents) =>
        prevContents.map((json) =>
          json.id === activeJsonTab
            ? {
                ...json,
                content: {
                  cs: currentJsonContent,
                  en: currentJsonContentEn,
                },
                lastEdited: new Date(),
              }
            : json
        )
      );

      setIsSaving(false);
      toast({
        title: "Změny uloženy",
        description: "Obsah byl úspěšně aktualizován v obou jazycích.",
        variant: "default",
      });
    }, 1000);
  };

  // Upravte funkci pro formátování JSON
  const handleFormatJson = (language: "cs" | "en") => {
    try {
      if (language === "cs") {
        const parsed = JSON.parse(currentJsonContent);
        setCurrentJsonContent(JSON.stringify(parsed, null, 2));
        setJsonError(null);
      } else {
        const parsed = JSON.parse(currentJsonContentEn);
        setCurrentJsonContentEn(JSON.stringify(parsed, null, 2));
        setJsonErrorEn(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (language === "cs") {
          setJsonError(error.message);
        } else {
          setJsonErrorEn(error.message);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Správa obsahu webu
        </h2>
        <p className="text-muted-foreground">
          Upravte obsah webu pomocí JSON souborů
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* JSON File List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>JSON Soubory</CardTitle>
            <CardDescription>Vyberte soubor pro úpravu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jsonContents.map((json) => (
                <div
                  key={json.id}
                  className={`p-3 rounded-md cursor-pointer flex items-center gap-2 hover:bg-muted transition-colors ${
                    activeJsonTab === json.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectJson(json.id)}
                >
                  <FileJson className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{json.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {json.path}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* JSON Editor */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {activeJsonTab
                ? jsonContents.find((j) => j.id === activeJsonTab)?.name ||
                  "JSON Editor"
                : "JSON Editor"}
            </CardTitle>
            <CardDescription>
              Upravte JSON data pro váš web ve dvou jazycích
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeJsonTab ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <Button
                    variant={activeLanguage === "cs" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLanguage("cs")}
                    className="w-full"
                  >
                    Čeština
                  </Button>
                  <Button
                    variant={activeLanguage === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLanguage("en")}
                    className="w-full"
                  >
                    English
                  </Button>
                </div>

                {activeLanguage === "cs" ? (
                  <div className="relative">
                    <Label htmlFor="json-cs" className="mb-2 block">
                      Česká verze
                    </Label>
                    <Textarea
                      id="json-cs"
                      value={currentJsonContent}
                      onChange={(e) => handleJsonContentChange(e, "cs")}
                      onBlur={() => validateJson(currentJsonContent, "cs")}
                      className="font-mono text-sm min-h-[400px] resize-none"
                      placeholder="Vložte JSON data..."
                    />
                    {jsonError && (
                      <div className="absolute bottom-2 right-2 text-xs text-red-500 bg-background p-1 rounded border border-red-200">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Chyba syntaxe
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Label htmlFor="json-en" className="mb-2 block">
                      English version
                    </Label>
                    <Textarea
                      id="json-en"
                      value={currentJsonContentEn}
                      onChange={(e) => handleJsonContentChange(e, "en")}
                      onBlur={() => validateJson(currentJsonContentEn, "en")}
                      className="font-mono text-sm min-h-[400px] resize-none"
                      placeholder="Insert JSON data..."
                    />
                    {jsonErrorEn && (
                      <div className="absolute bottom-2 right-2 text-xs text-red-500 bg-background p-1 rounded border border-red-200">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Syntax error
                      </div>
                    )}
                  </div>
                )}

                {jsonError && activeLanguage === "cs" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Chyba JSON syntaxe</AlertTitle>
                    <AlertDescription>{jsonError}</AlertDescription>
                  </Alert>
                )}

                {jsonErrorEn && activeLanguage === "en" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>JSON syntax error</AlertTitle>
                    <AlertDescription>{jsonErrorEn}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleFormatJson(activeLanguage)}
                    className="gap-1"
                  >
                    <Code className="h-4 w-4" />
                    {activeLanguage === "cs"
                      ? "Formátovat JSON"
                      : "Format JSON"}
                  </Button>

                  <Button
                    onClick={handleSaveJson}
                    disabled={
                      (activeLanguage === "cs" && !!jsonError) ||
                      (activeLanguage === "en" && !!jsonErrorEn) ||
                      isSaving
                    }
                    className="gap-1"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {activeLanguage === "cs" ? "Ukládání..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {activeLanguage === "cs"
                          ? "Uložit změny"
                          : "Save changes"}
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileJson className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">
                  Žádný soubor není vybrán
                </h3>
                <p className="max-w-md">
                  Vyberte JSON soubor ze seznamu vlevo pro úpravu obsahu vašeho
                  webu v češtině a angličtině.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* JSON Preview */}
      {activeJsonTab && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Náhled struktury</CardTitle>
            <CardDescription>Vizualizace struktury JSON dat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Česká verze</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-auto max-h-[300px]">
                    {(() => {
                      try {
                        const parsed = JSON.parse(currentJsonContent);
                        return renderJsonPreview(parsed);
                      } catch {
                        return "Neplatný JSON formát";
                      }
                    })()}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">English version</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-auto max-h-[300px]">
                    {(() => {
                      try {
                        const parsed = JSON.parse(currentJsonContentEn);
                        return renderJsonPreview(parsed);
                      } catch {
                        return "Invalid JSON format";
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to render a simplified JSON preview
function renderJsonPreview(json: JSON, level = 0): JSX.Element {
  if (typeof json === "object" && json !== null) {
    const isArray = Array.isArray(json);
    const items = Object.entries(json).map(([key, value], index, array) => {
      const isLast = index === array.length - 1;
      return (
        <div key={key}>
          <span className="text-blue-500">{isArray ? "" : `"${key}": `}</span>
          {typeof value === "object" && value !== null ? (
            <>
              <span>{isArray ? "- " : "{"}</span>
              <div style={{ marginLeft: "20px" }}>
                {renderJsonPreview(value, level + 1)}
              </div>
              <span>
                {isArray ? "" : "}"}
                {!isLast ? "," : ""}
              </span>
            </>
          ) : (
            <>
              <span
                className={
                  typeof value === "string"
                    ? "text-green-500"
                    : "text-amber-500"
                }
              >
                {typeof value === "string" ? `"${value}"` : value}
              </span>
              {!isLast ? "," : ""}
            </>
          )}
        </div>
      );
    });

    return <>{items}</>;
  }

  return <>{String(json)}</>;
}
