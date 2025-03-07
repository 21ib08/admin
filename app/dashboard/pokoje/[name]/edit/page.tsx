"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { X, Plus, Users, DollarSign, BedDouble } from "lucide-react";
import IconSelector from "@/components/IconSelector";
import Icon from "@/components/ui/icon";
import supabase from "@/database/supabase";
import { Session } from "@supabase/supabase-js";

interface Amenity {
  name: string;
  icon: string;
}

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  images: string[];
  description: string | null;
  amenities: Amenity[];
}

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const Roomparams = use(params);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newAmenity, setNewAmenity] = useState<string>("");
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    const setupAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      setHasChanges(true);
    }
  }, [room, loading]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!session || !roomId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (error) throw error;

        if (data) {
          setRoom({
            id: data.id,
            name: data.name,
            type: data.type,
            price: data.price,
            capacity: data.capacity,
            images: data.image_urls || [],
            description: data.description || "",
            amenities: data.amenities || [],
          });
        }
      } catch (error) {
        console.error("Error loading room:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, session]);

  const addAmenity = () => {
    if (!newAmenity || !selectedIconName || !room) return;

    const newAmenityObj: Amenity = {
      name: newAmenity,
      icon: selectedIconName,
    };

    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        amenities: [...prev.amenities, newAmenityObj],
      };
    });

    setNewAmenity("");
    setSelectedIconName(null);
    setHasChanges(true);
  };

  const deleteAmenity = (index: number) => {
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        amenities: prev.amenities.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!room) {
      alert("Data pokoje nejsou načtena.");
      return;
    }

    try {
      setLoading(true);

      if (!roomId) {
        alert("Room ID is required.");
        return;
      }

      // Upload new images first
      const newImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${roomId}_${Date.now()}_${file.name.replace(
            /[^a-zA-Z0-9.]/g,
            "_"
          )}`;

          const { error: uploadError } = await supabase.storage
            .from("room-images")
            .upload(fileName, file);

          if (uploadError) {
            throw new Error(
              `Nahrávání obrázku selhalo: ${uploadError.message}`
            );
          }

          const { data } = supabase.storage
            .from("room-images")
            .getPublicUrl(fileName);

          if (data?.publicUrl) {
            newImageUrls.push(data.publicUrl);
          }
        }
      }

      // Combine existing and new image URLs
      const existingImages = Array.isArray(room.images) ? room.images : [];
      const updatedImageUrls = [...existingImages, ...newImageUrls];

      // Prepare the update data
      const updateData = {
        name: room.name,
        type: room.type,
        price: room.price,
        capacity: room.capacity,
        image_urls: updatedImageUrls,
        description: room.description || null,
        amenities: room.amenities || [],
      };

      console.log("Updating room with data:", updateData); // Debug log

      // Update room data
      const { data, error: roomError } = await supabase
        .from("rooms")
        .update(updateData)
        .eq("id", room.id)
        .select()
        .single();

      if (roomError) {
        console.error("Supabase error:", roomError); // Debug log
        throw new Error(`Database error: ${roomError.message}`);
      }

      if (!data) {
        throw new Error("No data returned from update");
      }

      // Update local state
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              images: updatedImageUrls,
            }
          : null
      );

      setImageFiles([]);
      setHasChanges(false);
      alert("Změny byly úspěšně uloženy!");
    } catch (error) {
      console.error("Error details:", error); // Debug log
      if (error instanceof Error) {
        alert(`Chyba při ukládání změn: ${error.message}`);
      } else {
        alert("Neznámá chyba při ukládání změn");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteImageUrl = async (index: number) => {
    if (!room?.images[index]) return;

    try {
      setLoading(true);

      const url = room.images[index];
      const fileName = url.split("/").pop();

      if (!fileName) {
        throw new Error("Nelze získat název souboru z URL");
      }

      const { error: deleteStorageError } = await supabase.storage
        .from("room-images")
        .remove([fileName]);

      if (deleteStorageError) {
        console.error("Storage deletion error:", deleteStorageError);
      }

      const updatedImages = room.images.filter((_, i) => i !== index);

      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          image_urls: updatedImages,
        })
        .eq("id", room.id);

      if (updateError) throw updateError;

      setRoom((prev) =>
        prev
          ? {
              ...prev,
              images: updatedImages,
            }
          : null
      );
      setHasChanges(true);
    } catch (error) {
      console.error("Error deleting image:", error);
      alert(`Chyba při mazání obrázku: ${error || "Neznámá chyba"}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div className="w-full">
          <h1 className="text-3xl font-bold">{room?.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">
              <BedDouble className="w-4 h-4 mr-1" />
              {room?.type}
            </Badge>
            <Badge variant="secondary">
              <Users className="w-4 h-4 mr-1" />
              {room?.capacity} hostů
            </Badge>
            <Badge variant="secondary">
              <DollarSign className="w-4 h-4 mr-1" />
              {room?.price}Kč/noc
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={!hasChanges}
          >
            Zpět
          </Button>
          <Button onClick={handleSave} disabled={loading || !hasChanges}>
            {loading ? "Ukládání..." : "Uložit změny"}
          </Button>
        </div>
      </div>

      <div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detaily pokoje</CardTitle>
            <CardDescription>Základní informace o pokoji</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Název pokoje</Label>
                <Input
                  id="name"
                  value={room?.name || ""}
                  onChange={(e) =>
                    setRoom((prev) => ({ ...prev!, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Typ pokoje</Label>
                <Select
                  value={room?.type || "single"}
                  onValueChange={(value) =>
                    setRoom((prev) => ({ ...prev!, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jednolůžkový">Jednolůžkový</SelectItem>
                    <SelectItem value="dvojlůžkový">Dvojlůžkový</SelectItem>
                    <SelectItem value="apartmá">Apartmá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Cena za noc</Label>
                <Input
                  id="price"
                  type="number"
                  value={room?.price || 0}
                  onChange={(e) =>
                    setRoom((prev) => ({
                      ...prev!,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapacita</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={room?.capacity || 1}
                  onChange={(e) =>
                    setRoom((prev) => ({
                      ...prev!,
                      capacity: Math.max(1, Number(e.target.value)),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] p-2 border rounded-md resize-none bg-background dark:border-gray-700"
                value={room?.description || ""}
                onChange={(e) =>
                  setRoom((prev) =>
                    prev
                      ? {
                          ...prev,
                          description: e.target.value,
                        }
                      : null
                  )
                }
                placeholder="Zadejte popis pokoje..."
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Vybavení</h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-12 h-8 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {selectedIconName && (
                    <Icon
                      name={selectedIconName}
                      className="w-6 h-6 text-gray-700 dark:text-gray-300"
                    />
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="Přidat nové vybavení"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="w-full"
                />
                <Button onClick={() => setShowIconSelector(true)}>
                  Vybrat ikonu
                </Button>
                <Button onClick={addAmenity}>Přidat vybavení</Button>
              </div>
              {showIconSelector && (
                <IconSelector
                  onSelect={setSelectedIconName}
                  onClose={() => setShowIconSelector(false)}
                />
              )}
              <div className="mt-4 space-y-2">
                {room?.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center border p-2 rounded dark:border-gray-700"
                  >
                    <Icon
                      name={amenity.icon}
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    />
                    <span className="ml-2">{amenity.name}</span>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="ml-auto"
                      onClick={() => deleteAmenity(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galerie pokoje</CardTitle>
          <CardDescription>
            Nahrát a spravovat fotografie pokoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative w-40 h-40 flex-shrink-0">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700"
                      >
                        <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Nahrát novou fotografii</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {room?.images.map((url, index) => (
                <div
                  key={index}
                  className="relative w-40 h-40 flex-shrink-0 group rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Room ${Roomparams.name} image ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteImageUrl(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Smazat fotografii</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}

              {imageFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative w-40 h-40 flex-shrink-0 group rounded-lg overflow-hidden"
                >
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Room ${Roomparams.name} image ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Smazat fotografii</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
