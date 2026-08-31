package com.collaborative.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.service.UserService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
class UserControllerTest {
        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private UserService userService;

        private final UserSummary user = new UserSummary("user-1", "testuser", "testuser@example.com");
        private final ApiResponse<List<UserSummary>> response = new ApiResponse<>(true, List.of(user), 1);

        @Test
        void supportsUserLookupRoutes() throws Exception {
                when(userService.getUserById("user-1")).thenReturn(response);
                when(userService.getUserByUsername("testuser")).thenReturn(response);
                when(userService.getUserByEmail("testuser@example.com")).thenReturn(response);

                assertUserResponse("/api/users/by-userId/user-1");
                assertUserResponse("/api/users/by-username/testuser");
                assertUserResponse("/api/users/by-email/testuser@example.com");
        }

        @Test
        void supportsCollectionAndMutationRoutes() throws Exception {
                when(userService.getAllUsers()).thenReturn(response);
                when(userService.createUser(user)).thenReturn(response);
                when(userService.updateUserById("user-1", user)).thenReturn(response);
                when(userService.deleteUserById("user-1")).thenReturn(response);

                mockMvc.perform(get("/api/users"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.count").value(1));

                String body = "{\"_id\":\"user-1\",\"username\":\"testuser\",\"email\":\"testuser@example.com\", \"password\":\"password123\"}";
                mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(body))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data[0]._id").value("user-1"));

                mockMvc.perform(put("/api/users/update/user-1")
                                .contentType(MediaType.APPLICATION_JSON_VALUE)
                                .content(body))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data[0].username").value("testuser"));

                mockMvc.perform(delete("/api/users/delete/user-1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.count").value(1));
        }

        private void assertUserResponse(String path) throws Exception {
                mockMvc.perform(get(path))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data[0]._id").value("user-1"))
                                .andExpect(jsonPath("$.count").value(1));
        }
}