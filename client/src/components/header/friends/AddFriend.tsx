// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormControl,
//   FormMessage,
// } from "../../ui/form";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import z from "zod";
// import { FriendForm } from "@/lib/types";
// import { toast } from "react-toastify";
// import { useState, useEffect } from "react";
// import { type FriendRequest } from "@/lib/types";
// import { X } from "lucide-react";

// export function AddFriend() {
//   const form = useForm<z.infer<typeof FriendForm>>({
//     resolver: zodResolver(FriendForm),
//     defaultValues: {
//       email: "",
//     },
//   });
//   const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");

//   async function fetchPendingRequests() {
//     try {
//       const response = await fetch("http://localhost:3000/api/friend", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!response.ok) throw new Error("Failed to fetch");
//       const data = await response.json();
//       setPendingRequests(data);
//     } catch (error) {
//       // handle error (e.g., show toast)
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function deleteFriendRequest(id: string) {
//     console.log("hit", id);
//     try {
//       const response = await fetch(`http://localhost:3000/api/friend/${id}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (response.status === 404) {
//         return toast.error("Friend request not found.", { autoClose: 1000 });
//       } else if (response.status === 200) {
//         return toast.success("Friend request deleted successfully.", {
//           autoClose: 1000,
//         });
//       } else {
//         toast.error("Server error.", { autoClose: 1000 });
//       }
//     } catch (error) {
//       toast.error("Unexpected error.", { autoClose: 1000 });
//     } finally {
//       fetchPendingRequests();
//     }
//   }

//   useEffect(() => {
//     fetchPendingRequests();
//   }, []);

//   async function onSubmit(data: z.infer<typeof FriendForm>) {
//     try {
//       const response = await fetch(`http://localhost:3000/api/friend`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           email: data.email,
//         }),
//       });

//       if (response.status === 404) {
//         toast.error("Email not found. Please check the email address.", {
//           autoClose: 1000,
//         });
//       } else if (response.status === 400) {
//         const errData = await response.json();
//         if (errData.code === "FRIEND") {
//           toast.error("You cannot add yourself as a friend.", {
//             autoClose: 1000,
//           });
//         } else {
//           toast.error("Friend request already sent.", { autoClose: 1000 });
//         }
//       } else if (response.status === 201) {
//         toast.success("Friend request sent successfully!", { autoClose: 1000 });
//       } else {
//         toast.error("Unexpected error occurred.", { autoClose: 1000 });
//       }
//     } catch (error) {
//       toast.error("Server error.", { autoClose: 1000 });
//     } finally {
//       fetchPendingRequests();
//       form.reset();
//     }
//   }
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <p className="cursor-pointer hover:text-black">Add friends</p>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Add friend</DialogTitle>
//           <DialogDescription>Find a friend. Connect.</DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-6 w-full"
//           >
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input placeholder="Find an email" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <DialogClose asChild>
//               <Button type="submit" className="bg-gray-800">
//                 Send friend request
//               </Button>
//             </DialogClose>
//           </form>
//         </Form>
//         {loading ? (
//           "Loading..."
//         ) : pendingRequests.length === 0 ? (
//           "No pending requests."
//         ) : (
//           <div>
//             <p className="text-sm mb-1">Pending sent requests:</p>
//             <ul>
//               {pendingRequests.map((req) => (
//                 <li
//                   key={req._id}
//                   className="text-gray-600 text-sm flex border border-gray mb-1 rounded-lg px-1"
//                 >
//                   {req.recipient.email}
//                   <X
//                     className="h-5 ml-auto cursor-pointer "
//                     color="red"
//                     onClick={() => deleteFriendRequest(req.recipient._id)}
//                   />{" "}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
