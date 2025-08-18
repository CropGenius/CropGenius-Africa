// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { componentTagger } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/lovable-tagger/dist/index.js";
import { visualizer } from "file:///C:/Users/USER/Downloads/CROPGENIUS-main/CROPGENIUS-main/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\USER\\Downloads\\CROPGENIUS-main\\CROPGENIUS-main";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/",
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      mode === "production" && visualizer({
        filename: "dist/bundle-analysis.html",
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@supabase/storage-js": "@supabase/storage-js",
        "@": resolve(__vite_injected_original_dirname, "./src")
      },
      dedupe: ["react", "react-dom"]
    },
    server: {
      // Bind explicitly to IPv4 localhost to avoid IPv6/WS issues
      host: "localhost",
      port: 8080,
      open: true,
      hmr: {
        host: "localhost",
        port: 8080,
        protocol: "ws"
      }
    },
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: "es2020",
      ...mode === "production" && {
        tsconfigRaw: {
          compilerOptions: {
            skipLibCheck: true,
            noUnusedLocals: false,
            noUnusedParameters: false,
            strict: false
          }
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 3e3,
      target: "es2020",
      minify: "esbuild",
      cssCodeSplit: true,
      cssMinify: true,
      rollupOptions: {
        output: {
          format: "es",
          entryFileNames: "assets/[name]-[hash:8].js",
          chunkFileNames: "assets/[name]-[hash:8].js",
          assetFileNames: "assets/[name]-[hash:8].[ext]",
          manualChunks: {
            "mapbox": ["mapbox-gl"],
            "vendor": ["react", "react-dom", "react-router-dom"],
            "ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"]
          }
        },
        external: ["@supabase/storage-js"]
      },
      commonjsOptions: {
        include: [/node_modules/]
      },
      reportCompressedSize: true
    },
    define: {
      "process.env": env,
      global: "globalThis"
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["lucide-react", "@supabase/storage-js"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxDUk9QR0VOSVVTLW1haW5cXFxcQ1JPUEdFTklVUy1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXERvd25sb2Fkc1xcXFxDUk9QR0VOSVVTLW1haW5cXFxcQ1JPUEdFTklVUy1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9VU0VSL0Rvd25sb2Fkcy9DUk9QR0VOSVVTLW1haW4vQ1JPUEdFTklVUy1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy8nLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgICAgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIHZpc3VhbGl6ZXIoe1xuICAgICAgICBmaWxlbmFtZTogJ2Rpc3QvYnVuZGxlLWFuYWx5c2lzLmh0bWwnLFxuICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICAgIGJyb3RsaVNpemU6IHRydWVcbiAgICAgIH0pXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAc3VwYWJhc2Uvc3RvcmFnZS1qc1wiOiBcIkBzdXBhYmFzZS9zdG9yYWdlLWpzXCIsXG4gICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgICBkZWR1cGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJ11cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgLy8gQmluZCBleHBsaWNpdGx5IHRvIElQdjQgbG9jYWxob3N0IHRvIGF2b2lkIElQdjYvV1MgaXNzdWVzXG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQ6IDgwODAsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgaG1yOiB7XG4gICAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgICBwb3J0OiA4MDgwLFxuICAgICAgICBwcm90b2NvbDogJ3dzJ1xuICAgICAgfVxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgbG9nT3ZlcnJpZGU6IHsgJ3RoaXMtaXMtdW5kZWZpbmVkLWluLWVzbSc6ICdzaWxlbnQnIH0sXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgICAgLi4uKG1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiB7XG4gICAgICAgIHRzY29uZmlnUmF3OiB7XG4gICAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBza2lwTGliQ2hlY2s6IHRydWUsXG4gICAgICAgICAgICBub1VudXNlZExvY2FsczogZmFsc2UsXG4gICAgICAgICAgICBub1VudXNlZFBhcmFtZXRlcnM6IGZhbHNlLFxuICAgICAgICAgICAgc3RyaWN0OiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDMwMDAsXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGZvcm1hdDogJ2VzJyxcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2g6OF0uanMnLFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaDo4XS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoOjhdLltleHRdJyxcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdtYXBib3gnOiBbJ21hcGJveC1nbCddLFxuICAgICAgICAgICAgJ3ZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgICd1aSc6IFsnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudScsICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0J11cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVybmFsOiBbJ0BzdXBhYmFzZS9zdG9yYWdlLWpzJ11cbiAgICAgIH0sXG4gICAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXSxcbiAgICAgIH0sXG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZVxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAncHJvY2Vzcy5lbnYnOiBlbnYsXG4gICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnLCAnQHN1cGFiYXNlL3N0b3JhZ2UtanMnXVxuICAgIH1cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQW1XLFNBQVMsY0FBYyxlQUFlO0FBQ3pZLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxrQkFBa0I7QUFKM0IsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLE1BQzFDLFNBQVMsZ0JBQWdCLFdBQVc7QUFBQSxRQUNsQyxVQUFVO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixZQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLElBQ2hCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLHdCQUF3QjtBQUFBLFFBQ3hCLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDakM7QUFBQSxNQUNBLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUMvQjtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsTUFFTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsTUFDWjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBLE1BQ3BELFFBQVE7QUFBQSxNQUNSLEdBQUksU0FBUyxnQkFBZ0I7QUFBQSxRQUMzQixhQUFhO0FBQUEsVUFDWCxpQkFBaUI7QUFBQSxZQUNmLGNBQWM7QUFBQSxZQUNkLGdCQUFnQjtBQUFBLFlBQ2hCLG9CQUFvQjtBQUFBLFlBQ3BCLFFBQVE7QUFBQSxVQUNWO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCx1QkFBdUI7QUFBQSxNQUN2QixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixjQUFjO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixjQUFjO0FBQUEsWUFDWixVQUFVLENBQUMsV0FBVztBQUFBLFlBQ3RCLFVBQVUsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDbkQsTUFBTSxDQUFDLDBCQUEwQixpQ0FBaUMsd0JBQXdCO0FBQUEsVUFDNUY7QUFBQSxRQUNGO0FBQUEsUUFDQSxVQUFVLENBQUMsc0JBQXNCO0FBQUEsTUFDbkM7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2YsU0FBUyxDQUFDLGNBQWM7QUFBQSxNQUMxQjtBQUFBLE1BQ0Esc0JBQXNCO0FBQUEsSUFDeEI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGVBQWU7QUFBQSxNQUNmLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsU0FBUyxXQUFXO0FBQUEsTUFDOUIsU0FBUyxDQUFDLGdCQUFnQixzQkFBc0I7QUFBQSxJQUNsRDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
